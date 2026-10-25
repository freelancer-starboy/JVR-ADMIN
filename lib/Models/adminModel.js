import mongoose from "mongoose";

// Admin logins. There is no sign-up: create admins with `npm run create-admin`
// or by inserting a document into the `admins` collection by hand.
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // bcrypt hash
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema, "admins");

export default Admin;
