// Simple in-memory, per-key fixed-window limiter for the login endpoint.
// Per server instance only (resets on restart / not shared between serverless instances),
// which is enough to slow down password guessing.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

const attempts = global._loginAttempts || (global._loginAttempts = new Map());

function prune(now) {
  if (attempts.size < 1000) return;
  for (const [key, entry] of attempts) {
    if (entry.resetAt <= now) attempts.delete(key);
  }
}

// Returns { limited, retryAfter } without recording an attempt.
export function checkRateLimit(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) return { limited: false, retryAfter: 0 };
  if (entry.count >= MAX_ATTEMPTS) {
    return { limited: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { limited: false, retryAfter: 0 };
}

export function recordFailedAttempt(key) {
  const now = Date.now();
  prune(now);
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function resetAttempts(key) {
  attempts.delete(key);
}
