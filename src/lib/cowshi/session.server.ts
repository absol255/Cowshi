import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { findBettorByBank, publicUser, withStore } from "./store.server";
import { nextId } from "./engine";
import {
  NEW_ACCOUNT_MB,
  validateBankAccountNumber,
  validateUsername,
} from "./rules";
import type { User } from "./types";

// Two separate sessions:
//   USER_COOKIE  -> id of a `User` (a bettor)
//   ADMIN_COOKIE -> id of an `Admin`
// Both are HMAC-signed, so a cookie can't be forged or edited by hand.

export const USER_COOKIE = "cowshi_user";
export const ADMIN_COOKIE = "cowshi_admin";

let warned = false;
function secret(): string {
  const configured = process.env.SECRET_KEY || process.env.FLASK_SECRET_KEY;
  if (configured) return configured;
  const db = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (process.env.NODE_ENV === "production" && !warned) {
    warned = true;
    console.warn("[cowshi] SECRET_KEY is not set — set it in your Vercel project settings.");
  }
  return db ? createHash("sha256").update(`cowshi:${db}`).digest("hex") : "cowshi-dev-secret";
}

function mac(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function signValue(value: string): string {
  return `${value}.${mac(value)}`;
}

export function readSigned(raw: string | undefined): string | null {
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot < 1) return null;
  const value = raw.slice(0, dot);
  const given = Buffer.from(raw.slice(dot + 1), "hex");
  const expected = Buffer.from(mac(value), "hex");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  return value;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  };
}

function signedId(raw: string | undefined): number {
  const value = readSigned(raw);
  return value === null ? NaN : Number(value);
}

function setUserCookie(userId: number) {
  setCookie(USER_COOKIE, signValue(String(userId)), sessionCookieOptions());
}

/** The signed-in bettor (a `User`). No session → null. Never falls back to a demo trader. */
export async function currentUser(): Promise<User | null> {
  const id = signedId(getCookie(USER_COOKIE));
  if (!Number.isInteger(id)) return null;
  return withStore((store) => {
    const user = publicUser(store, id);
    if (!user || user.username === "market_maker") return null;
    return user;
  });
}

/** True only for a valid session that belongs to an existing `Admin`. */
export async function isAdmin() {
  const id = signedId(getCookie(ADMIN_COOKIE));
  if (!Number.isInteger(id)) return false;
  return withStore((store) => store.admins.some((a) => a.id === id));
}

export async function requireBettor(): Promise<User> {
  const user = await currentUser();
  if (!user) throw new Error("Log in with your bank account number to bet");
  return user;
}

export async function loginWithBankAccount(bankAccountNumber: number): Promise<User> {
  const problem = validateBankAccountNumber(bankAccountNumber);
  if (problem) throw new Error(problem);
  const user = await withStore((store) => findBettorByBank(store, bankAccountNumber));
  if (!user) throw new Error("No Cowshi account for that bank account number.");
  setUserCookie(user.id);
  return user;
}

export async function openAccount(username: string, bankAccountNumber: number): Promise<User> {
  const nameProblem = validateUsername(username);
  if (nameProblem) throw new Error(nameProblem);
  const bankProblem = validateBankAccountNumber(bankAccountNumber);
  if (bankProblem) throw new Error(bankProblem);

  const user = await withStore((store) => {
    const handle = username.trim();
    if (store.users.some((u) => u.username.toLowerCase() === handle.toLowerCase())) {
      throw new Error("That handle is already taken.");
    }
    if (store.users.some((u) => u.bank_account_number === bankAccountNumber)) {
      throw new Error("That bank account number is already on the book.");
    }
    const created: User = {
      id: nextId(store),
      username: handle,
      macho_bucks: NEW_ACCOUNT_MB,
      bank_account_number: bankAccountNumber,
      created_at: new Date().toISOString(),
    };
    store.users.push(created);
    return publicUser(store, created.id)!;
  });
  setUserCookie(user.id);
  return user;
}

export function logoutBettor() {
  deleteCookie(USER_COOKIE, { path: "/" });
}

export function setAdminCookie(adminId: number) {
  setCookie(ADMIN_COOKIE, signValue(String(adminId)), sessionCookieOptions());
}
