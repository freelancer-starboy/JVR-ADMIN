import { AUTH_COOKIE, SESSION_MAX_AGE, verifyAdminToken } from "lib/auth/jwt";

// Node (API route) helpers for the admin session cookie.

function cookieAttributes(maxAge) {
  const parts = [`Path=/`, `HttpOnly`, `SameSite=Lax`, `Max-Age=${maxAge}`];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function setSessionCookie(res, token) {
  res.setHeader("Set-Cookie", `${AUTH_COOKIE}=${token}; ${cookieAttributes(SESSION_MAX_AGE)}`);
}

export function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `${AUTH_COOKIE}=; ${cookieAttributes(0)}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );
}

export function getSession(req) {
  return verifyAdminToken(req.cookies?.[AUTH_COOKIE]);
}

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}
