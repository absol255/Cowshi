import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { createHash, pbkdf2Sync, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/password.server-CXPmV40H.js
var password_server_CXPmV40H_exports = /* @__PURE__ */ __exportAll({
	n: () => password_server_exports,
	t: () => hashPassword
});
var password_server_exports = /* @__PURE__ */ __exportAll$1({
	hashPassword: () => hashPassword,
	verifyPassword: () => verifyPassword
});
var N = 32768;
var R = 8;
var P = 1;
function hashPassword(password) {
	const salt = randomBytes(12).toString("base64url").slice(0, 16);
	return `scrypt:${N}:${R}:${P}$${salt}$${scryptSync(password, salt, 64, {
		N,
		r: R,
		p: P,
		maxmem: 132 * N * R * P
	}).toString("hex")}`;
}
function verifyPassword(password, stored) {
	if (/^[0-9a-f]{64}$/.test(stored)) {
		const legacy = Buffer.from(createHash("sha256").update(password).digest("hex"));
		const given = Buffer.from(stored);
		return legacy.length === given.length && timingSafeEqual(legacy, given);
	}
	const parts = stored.split("$");
	if (parts.length !== 3) return false;
	const [method, salt, expectedHex] = parts;
	const [kind, ...args] = method.split(":");
	let actual;
	try {
		if (kind === "scrypt") {
			const [n = N, r = R, p = P] = args.map(Number);
			actual = scryptSync(password, salt, 64, {
				N: n,
				r,
				p,
				maxmem: 132 * n * r * p
			});
		} else if (kind === "pbkdf2") {
			const [digest = "sha256", iterations = "600000"] = args;
			actual = pbkdf2Sync(password, salt, Number(iterations), Buffer.from(expectedHex, "hex").length, digest);
		} else return false;
	} catch {
		return false;
	}
	const expected = Buffer.from(expectedHex, "hex");
	return expected.length === actual.length && timingSafeEqual(expected, actual);
}
//#endregion
export { password_server_CXPmV40H_exports as n, hashPassword as t };
