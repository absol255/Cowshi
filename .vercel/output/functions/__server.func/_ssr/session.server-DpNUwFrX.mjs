import { a as validateBankAccountNumber, c as validateUsername, t as NEW_ACCOUNT_MB } from "./rules-OkhjTODs.mjs";
import { a as getCookie, i as deleteCookie$1, o as setCookie$1 } from "./ssr.mjs";
import { nextId } from "./engine-DMoMN_5H.mjs";
import { findBettorByBank, publicUser, withStore } from "./store.server-18l2BOsw.mjs";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/session.server-DpNUwFrX.js
var USER_COOKIE = "cowshi_user";
var ADMIN_COOKIE = "cowshi_admin";
var warned = false;
function secret() {
	const configured = process.env.SECRET_KEY || process.env.FLASK_SECRET_KEY;
	if (configured) return configured;
	const db = process.env.DATABASE_URL || process.env.POSTGRES_URL;
	if (!warned) {
		warned = true;
		console.warn("[cowshi] SECRET_KEY is not set — set it in your Vercel project settings.");
	}
	return db ? createHash("sha256").update(`cowshi:${db}`).digest("hex") : "cowshi-dev-secret";
}
function mac(value) {
	return createHmac("sha256", secret()).update(value).digest("hex");
}
function signValue(value) {
	return `${value}.${mac(value)}`;
}
function readSigned(raw) {
	if (!raw) return null;
	const dot = raw.lastIndexOf(".");
	if (dot < 1) return null;
	const value = raw.slice(0, dot);
	const given = Buffer.from(raw.slice(dot + 1), "hex");
	const expected = Buffer.from(mac(value), "hex");
	if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
	return value;
}
function sessionCookieOptions() {
	return {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		secure: true,
		maxAge: 604800
	};
}
function signedId(raw) {
	const value = readSigned(raw);
	return value === null ? NaN : Number(value);
}
function setUserCookie(userId) {
	setCookie$1(USER_COOKIE, signValue(String(userId)), sessionCookieOptions());
}
/** The signed-in bettor (a `User`). No session → null. Never falls back to a demo trader. */
async function currentUser() {
	const id = signedId(getCookie(USER_COOKIE));
	if (!Number.isInteger(id)) return null;
	return withStore((store) => {
		const user = publicUser(store, id);
		if (!user || user.username === "market_maker") return null;
		return user;
	});
}
/** True only for a valid session that belongs to an existing `Admin`. */
async function isAdmin() {
	const id = signedId(getCookie(ADMIN_COOKIE));
	if (!Number.isInteger(id)) return false;
	return withStore((store) => store.admins.some((a) => a.id === id));
}
async function requireBettor() {
	const user = await currentUser();
	if (!user) throw new Error("Log in with your bank account number to bet");
	return user;
}
async function loginWithBankAccount(bankAccountNumber) {
	const problem = validateBankAccountNumber(bankAccountNumber);
	if (problem) throw new Error(problem);
	const user = await withStore((store) => findBettorByBank(store, bankAccountNumber));
	if (!user) throw new Error("No Cowshi account for that bank account number.");
	setUserCookie(user.id);
	return user;
}
async function openAccount(username, bankAccountNumber) {
	const nameProblem = validateUsername(username);
	if (nameProblem) throw new Error(nameProblem);
	const bankProblem = validateBankAccountNumber(bankAccountNumber);
	if (bankProblem) throw new Error(bankProblem);
	const user = await withStore((store) => {
		const handle = username.trim();
		if (store.users.some((u) => u.username.toLowerCase() === handle.toLowerCase())) throw new Error("That handle is already taken.");
		if (store.users.some((u) => u.bank_account_number === bankAccountNumber)) throw new Error("That bank account number is already on the book.");
		const created = {
			id: nextId(store),
			username: handle,
			macho_bucks: NEW_ACCOUNT_MB,
			bank_account_number: bankAccountNumber,
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		};
		store.users.push(created);
		return publicUser(store, created.id);
	});
	setUserCookie(user.id);
	return user;
}
function logoutBettor() {
	deleteCookie$1(USER_COOKIE, { path: "/" });
}
function setAdminCookie(adminId) {
	setCookie$1(ADMIN_COOKIE, signValue(String(adminId)), sessionCookieOptions());
}
//#endregion
export { currentUser, isAdmin, loginWithBankAccount, logoutBettor, openAccount, requireBettor, setAdminCookie };
