/**
 * Run ONCE to bcrypt-hash all plain-text admin passwords.
 * Usage: node reset_admin_password.js
 * Delete this file after running.
 */
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

(async () => {
  const db = await mysql.createConnection({
    host: "localhost", user: "root", password: "", database: "issue_tracking"
  });

  const [admins] = await db.query("SELECT admin_id, admin_email, admin_password FROM admin");

  for (const admin of admins) {
    // Skip if already bcrypt hashed
    if (admin.admin_password.startsWith("$2b$") || admin.admin_password.startsWith("$2a$")) {
      console.log(`⏭️  ${admin.admin_email} — already hashed, skipping`);
      continue;
    }
    const hashed = await bcrypt.hash(admin.admin_password, 10);
    await db.query("UPDATE admin SET admin_password=? WHERE admin_id=?", [hashed, admin.admin_id]);
    console.log(`✅ ${admin.admin_email} — hashed (was: "${admin.admin_password}")`);
  }

  console.log("\nDone! You can now delete this file.");
  await db.end();
})();
