#!/usr/bin/env node
/*
 * Creates an admin login, or resets the password of an existing one.
 *
 *   node scripts/create-admin.js <username> <password> [display name]
 *   npm run create-admin -- <username> <password> [display name]
 *
 * Reads MONGO_URI from the environment or from .env.local / .env in the project root.
 * The password is stored as a bcrypt hash in the `admins` collection.
 */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

function loadEnvFile(file) {
  const fullPath = path.join(__dirname, "..", file);
  if (!fs.existsSync(fullPath)) return;
  for (const line of fs.readFileSync(fullPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || line.trim().startsWith("#")) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2");
  }
}

async function main() {
  const [username, password, ...nameParts] = process.argv.slice(2);

  if (!username || !password) {
    console.error("Usage: node scripts/create-admin.js <username> <password> [display name]");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Please use a password with at least 8 characters.");
    process.exit(1);
  }

  loadEnvFile(".env.local");
  loadEnvFile(".env");
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set (add it to .env.local or the environment).");
    process.exit(1);
  }

  const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    name: { type: String },
    createdAt: { type: Date, default: Date.now },
  });
  const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema, "admins");

  await mongoose.connect(process.env.MONGO_URI);

  const hash = await bcrypt.hash(password, 12);
  const name = nameParts.join(" ").trim();
  const existing = await Admin.findOne({ username: username.trim() });

  await Admin.updateOne(
    { username: username.trim() },
    {
      $set: { password: hash, ...(name ? { name } : {}) },
      $setOnInsert: { createdAt: new Date(), ...(name ? {} : { name: username.trim() }) },
    },
    { upsert: true }
  );

  console.log(
    existing
      ? `Updated the password for admin "${username.trim()}".`
      : `Created admin "${username.trim()}". You can now log in at /login.`
  );
}

main()
  .catch((error) => {
    console.error("Failed to create admin:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
