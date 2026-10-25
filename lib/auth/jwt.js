import { SignJWT, jwtVerify } from "jose";

// Shared by the edge middleware and Node API routes - keep this file free of Node-only imports.

export const AUTH_COOKIE = "admin_token";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

const ISSUER = "jvr-admin";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export function isJwtConfigured() {
  return Boolean(process.env.JWT_SECRET);
}

export async function signAdminToken({ id, username }) {
  const secret = getSecret();
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(id))
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret);
}

// Resolves to { sub, username } or null when the token is missing/invalid/expired.
export async function verifyAdminToken(token) {
  const secret = getSecret();
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"], issuer: ISSUER });
    if (!payload.sub || typeof payload.username !== "string") return null;
    return { sub: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}
