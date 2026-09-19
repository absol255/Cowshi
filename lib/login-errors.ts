// What the sign-in forms tell the person. Specific messages make a wrong username or number easy to
// spot on a small site. Set GENERIC_LOGIN_ERRORS=true to say only "wrong username or password".

const generic = () => process.env.GENERIC_LOGIN_ERRORS === "true";

export function bettorError(username: string, exists: boolean): string {
  if (generic()) return "Wrong username or bank account number";
  return exists
    ? "That bank account number doesn't match this bettor"
    : `There's no bettor called "${username}"`;
}

export function adminError(username: string, reason: "unknown" | "password" | "unsupported"): string {
  if (generic()) return "Wrong admin username or password";
  if (reason === "unknown") return `There's no admin called "${username}"`;
  if (reason === "unsupported") {
    return "This admin's password_hash is in a format the app can't read. Set ADMIN_PASSWORD (and ADMIN_USERNAME) in your environment variables and redeploy to reset it.";
  }
  return "Wrong password";
}
