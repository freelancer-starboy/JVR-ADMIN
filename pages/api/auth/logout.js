import { rejectMethod } from "lib/http";
import { clearSessionCookie } from "lib/auth/session";

export default function handler(req, res) {
  if (rejectMethod(req, res, ["POST"])) return;
  clearSessionCookie(res);
  return res.status(200).json({ message: "Logged out" });
}
