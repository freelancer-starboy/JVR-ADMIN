import connectDb from "lib/database/db";
import Admin from "lib/Models/adminModel";
import { isValidObjectId, rejectMethod } from "lib/http";
import { clearSessionCookie, getSession } from "lib/auth/session";

export default async function handler(req, res) {
  if (rejectMethod(req, res, ["GET"])) return;

  const session = await getSession(req);
  if (!session) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    await connectDb();
    const admin = isValidObjectId(session.sub)
      ? await Admin.findById(session.sub).select("username name createdAt").lean()
      : null;

    if (!admin) {
      // The admin was removed from the database after the token was issued
      clearSessionCookie(res);
      return res.status(401).json({ message: "Account no longer exists" });
    }

    return res.status(200).json({
      admin: {
        id: String(admin._id),
        username: admin.username,
        name: admin.name || admin.username,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("[auth] /me failed:", error.message);
    return res.status(500).json({ message: "Could not load your account" });
  }
}
