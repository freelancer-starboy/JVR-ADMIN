import bcrypt from "bcryptjs";
import crypto from "crypto";

// A valid hash of a random string, used so that unknown usernames take as long as known ones.
const DUMMY_HASH = "$2a$12$ROMjYhXBAX1gHWkr6bPnuOchYLztYJvLSzMqQBkj2UdYaerH147iy";

function timingSafeEqualStrings(a, b) {
  const digestA = crypto.createHash("sha256").update(String(a)).digest();
  const digestB = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

// Compares a login attempt with the stored password. Stored values should be bcrypt
// hashes; plain-text values (inserted by hand) are still accepted but logged.
export async function verifyPassword(candidate, stored, username) {
  if (typeof stored !== "string" || !stored) {
    await bcrypt.compare(String(candidate), DUMMY_HASH);
    return false;
  }
  if (stored.startsWith("$2")) {
    return bcrypt.compare(String(candidate), stored);
  }
  console.warn(
    `[auth] Admin "${username}" has a plain-text password in MongoDB. ` +
      "Replace it with a bcrypt hash (run: npm run create-admin -- <username> <password>)."
  );
  return timingSafeEqualStrings(candidate, stored);
}

export async function burnTime(candidate) {
  await bcrypt.compare(String(candidate), DUMMY_HASH);
}
