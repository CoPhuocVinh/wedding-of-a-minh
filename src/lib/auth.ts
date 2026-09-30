import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// One shared admin account: ADMIN_USERNAME / ADMIN_PASSWORD, both "admin" when
// unset. A session is "<expiry>.<hmac>" in an httpOnly cookie; changing the
// password logs everyone out.

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 30;

const adminUser = () => process.env.ADMIN_USERNAME || "admin";
const adminPass = () => process.env.ADMIN_PASSWORD || "admin";

// Must not be guessable even when the password is the default, or anyone could
// forge a session cookie. The Apps Script secret only lives on the server.
function secret() {
  const key = process.env.SESSION_SECRET || process.env.APPS_SCRIPT_SECRET || "local-dev-only";
  return `${key}:${adminPass()}`;
}

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");
const digest = (s: string) => createHash("sha256").update(s).digest();

export function checkLogin(username: string, password: string) {
  // Compare both, always, so timing doesn't reveal which one was wrong.
  const userOk = timingSafeEqual(digest(username.trim()), digest(adminUser()));
  const passOk = timingSafeEqual(digest(password), digest(adminPass()));
  return userOk && passOk;
}

export async function startSession() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = Buffer.from(sign(exp));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** For admin pages and actions: bounce to the login page when signed out. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
