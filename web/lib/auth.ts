import { cookies } from "next/headers";
import { withStore, publicUser } from "./store";

export const USER_COOKIE = "cowshi_user";
export const ADMIN_COOKIE = "cowshi_admin";

export async function currentUser() {
  const jar = await cookies();
  const raw = jar.get(USER_COOKIE)?.value;
  const id = raw ? Number(raw) : NaN;
  return withStore((store) => {
    const fallback = store.users.find((u) => u.username === "cowboy") ?? store.users[0];
    const user = Number.isFinite(id) ? publicUser(store, id) : null;
    return user ?? publicUser(store, fallback.id);
  });
}

export async function isAdmin() {
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === "1";
}
