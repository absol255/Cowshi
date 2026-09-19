import { createHash, pbkdf2Sync, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Hashes are Werkzeug-compatible (Python's generate_password_hash / check_password_hash),
// so admin rows created that way can sign in here.

const N = 32768;
const R = 8;
const P = 1;

export function hashPassword(password: string): string {
  const salt = randomBytes(12).toString("base64url").slice(0, 16);
  const hash = scryptSync(password, salt, 64, { N, r: R, p: P, maxmem: 132 * N * R * P });
  return `scrypt:${N}:${R}:${P}$${salt}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  // Older Cowshi data stored a bare sha256 hex digest; keep those admins able to sign in.
  if (/^[0-9a-f]{64}$/.test(stored)) {
    const legacy = Buffer.from(createHash("sha256").update(password).digest("hex"));
    const given = Buffer.from(stored);
    return legacy.length === given.length && timingSafeEqual(legacy, given);
  }
  const parts = stored.split("$");
  if (parts.length !== 3) return false;
  const [method, salt, expectedHex] = parts;
  const [kind, ...args] = method.split(":");
  let actual: Buffer;
  try {
    if (kind === "scrypt") {
      const [n = N, r = R, p = P] = args.map(Number);
      actual = scryptSync(password, salt, 64, { N: n, r, p, maxmem: 132 * n * r * p });
    } else if (kind === "pbkdf2") {
      const [digest = "sha256", iterations = "600000"] = args;
      actual = pbkdf2Sync(password, salt, Number(iterations), Buffer.from(expectedHex, "hex").length, digest);
    } else {
      return false;
    }
  } catch {
    return false;
  }
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export type HashKind = "scrypt" | "pbkdf2" | "sha256" | "plain" | "unsupported";

/** What kind of value is in admins.password_hash? */
export function hashKind(stored: string): HashKind {
  if (stored.startsWith("scrypt:")) return "scrypt";
  if (stored.startsWith("pbkdf2:")) return "pbkdf2";
  if (/^[0-9a-f]{64}$/.test(stored)) return "sha256";
  // Anything with a $ or : in it looks like a hash from some other scheme (bcrypt, argon2, ...).
  if (/[$:]/.test(stored)) return "unsupported";
  return "plain";
}
