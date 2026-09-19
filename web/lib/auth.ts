import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { withStore, publicUser } from "./store";

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
  // Fall back to something derived from the database credentials, else a dev-only constant.
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

/** The signed-in bettor (a `User`). With no valid session it falls back to the demo trader. */
export async function currentUser() {
  const jar = await cookies();
  const id = signedId(jar.get(USER_COOKIE)?.value);
  return withStore((store) => {
    const fallback = store.users.find((u) => u.username === "cowboy") ?? store.users[0];
    const user = Number.isInteger(id) ? publicUser(store, id) : null;
    // The market maker is house liquidity, never a bettor.
    const bettor = user && user.username !== "market_maker" ? user : null;
    return bettor ?? publicUser(store, fallback.id);
  });
}

/** True only for a valid session that belongs to an existing `Admin`. */
export async function isAdmin() {
  const jar = await cookies();
  const id = signedId(jar.get(ADMIN_COOKIE)?.value);
  if (!Number.isInteger(id)) return false;
  return withStore((store) => store.admins.some((a) => a.id === id));
}
