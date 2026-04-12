/**
 * Seed script to create the first admin user
 * Usage: DATABASE_URL=postgres://... node scripts/seed-admin.mjs
 */
import postgres from "postgres";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@tracaocomercial.com.br";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = process.env.ADMIN_NAME || "Administrador";

async function main() {
  const sql = postgres(DATABASE_URL);

  try {
    // Check if admin already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${ADMIN_EMAIL}`;
    if (existing.length > 0) {
      console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
      await sql.end();
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Insert admin user
    const result = await sql`
      INSERT INTO users (email, password_hash, name, role, ativo)
      VALUES (${ADMIN_EMAIL}, ${passwordHash}, ${ADMIN_NAME}, 'admin', true)
      RETURNING id, email, name, role
    `;

    console.log("Admin user created:", result[0]);
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log("\n⚠️  IMPORTANT: Change the password after first login!");
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await sql.end();
  }
}

main();
