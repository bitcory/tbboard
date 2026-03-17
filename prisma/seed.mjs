import "dotenv/config";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse DATABASE_URL (e.g. "file:./dev.db" or "file:/app/data/dev.db")
function getDbPath() {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  const filePath = url.replace(/^file:/, "");
  if (path.isAbsolute(filePath)) return filePath;
  return path.resolve(__dirname, filePath);
}

const db = new Database(getDbPath());

function cuid() {
  return "c" + randomBytes(12).toString("hex");
}

async function main() {
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "admin1234",
    10
  );
  const tbPassword = await bcrypt.hash(
    process.env.TB_PASSWORD || "tb1234",
    10
  );

  const upsert = db.prepare(`
    INSERT INTO User (id, username, password, name, createdAt)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(username) DO NOTHING
  `);

  upsert.run(cuid(), "admin", adminPassword, "관리자");
  upsert.run(cuid(), "tb", tbPassword, "TB");

  console.log("Seed completed: admin, tb accounts created");
  db.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
