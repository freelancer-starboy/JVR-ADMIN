import connectDb from "lib/database/db";
import Admin from "lib/Models/adminModel";
import { rejectMethod } from "lib/http";
import { isJwtConfigured, signAdminToken } from "lib/auth/jwt";
import { burnTime, verifyPassword } from "lib/auth/password";
import { checkRateLimit, recordFailedAttempt, resetAttempts } from "lib/auth/rateLimit";
import { getClientIp, setSessionCookie } from "lib/auth/session";

const INVALID = "Invalid username or password";

export default async function handler(req, res) {
  if (rejectMethod(req, res, ["POST"])) return;

  if (!isJwtConfigured()) {
    console.error("[auth] JWT_SECRET is not set - logins are disabled");
    return res.status(500).json({ message: "Login is not configured on the server (JWT_SECRET missing)" });
  }

  const ip = getClientIp(req);
  const { limited, retryAfter } = checkRateLimit(ip);
  if (limited) {
    res.setHeader("Retry-After", String(retryAfter));
    return res.status(429).json({
      message: `Too many login attempts. Try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
    });
  }

  const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!username || !password || username.length > 100 || password.length > 200) {
    return res.status(400).json({ message: "Enter your username and password" });
  }

  try {
    await connectDb();
    const admin = await Admin.findOne({ username }).lean();

    let valid = false;
    if (admin) {
      valid = await verifyPassword(password, admin.password, admin.username);
    } else {
      await burnTime(password);
    }

    if (!valid) {
      recordFailedAttempt(ip);
      return res.status(401).json({ message: INVALID });
    }

    resetAttempts(ip);
    const token = await signAdminToken({ id: admin._id, username: admin.username });
    setSessionCookie(res, token);

    return res.status(200).json({
      message: "Logged in",
      admin: { id: String(admin._id), username: admin.username, name: admin.name || admin.username },
    });
  } catch (error) {
    console.error("[auth] Login failed:", error.message);
    return res.status(500).json({ message: "Could not log in right now. Please try again." });
  }
}
