/**
 * Seed script: Creates the first organization + admin user + default pipeline stages.
 * 
 * Usage:
 *   DATABASE_URL=postgres://... ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret ADMIN_NAME="Admin" ORG_NAME="Minha Empresa" node scripts/seed-admin.mjs
 * 
 * Environment variables:
 *   DATABASE_URL   - PostgreSQL connection string (required)
 *   ADMIN_EMAIL    - Admin email (default: admin@tracaocomercial.com.br)
 *   ADMIN_PASSWORD - Admin password (default: Tracao2026)
 *   ADMIN_NAME     - Admin name (default: Administrador)
 *   ORG_NAME       - Organization name (default: Tração Comercial)
 */

import postgres from "postgres";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL is required");
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@tracaocomercial.com.br";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Tracao2026";
const ADMIN_NAME = process.env.ADMIN_NAME || "Administrador";
const ORG_NAME = process.env.ORG_NAME || "Tração Comercial";

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const sql = postgres(DATABASE_URL);

  try {
    // 1. Create or find organization
    const orgSlug = slugify(ORG_NAME);
    const existingOrg = await sql`SELECT id FROM organizations WHERE slug = ${orgSlug} LIMIT 1`;
    
    let orgId;
    if (existingOrg.length > 0) {
      orgId = existingOrg[0].id;
      console.log(`Organization "${ORG_NAME}" already exists (id: ${orgId})`);
    } else {
      const [newOrg] = await sql`
        INSERT INTO organizations (nome, slug, plano, max_usuarios)
        VALUES (${ORG_NAME}, ${orgSlug}, 'profissional', 20)
        RETURNING id
      `;
      orgId = newOrg.id;
      console.log(`Created organization "${ORG_NAME}" (id: ${orgId})`);
    }

    // 2. Create or update admin user
    const existingUser = await sql`SELECT id FROM users WHERE email = ${ADMIN_EMAIL} LIMIT 1`;
    if (existingUser.length > 0) {
      await sql`
        UPDATE users SET organization_id = ${orgId}, role = 'admin', is_org_admin = true, ativo = true
        WHERE id = ${existingUser[0].id}
      `;
      console.log(`Updated existing user "${ADMIN_EMAIL}" to admin of org ${orgId}`);
    } else {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await sql`
        INSERT INTO users (organization_id, email, password_hash, name, role, is_org_admin, ativo)
        VALUES (${orgId}, ${ADMIN_EMAIL}, ${passwordHash}, ${ADMIN_NAME}, 'admin', true, true)
      `;
      console.log(`Created admin user "${ADMIN_EMAIL}"`);
    }

    // 3. Seed default pipeline stages if none exist
    const existingStages = await sql`SELECT id FROM pipeline_stages WHERE organization_id = ${orgId} LIMIT 1`;
    if (existingStages.length === 0) {
      await sql`
        INSERT INTO pipeline_stages (organization_id, nome, ordem, cor, probabilidade_fechamento)
        VALUES
          (${orgId}, 'Prospecção', 1, '#6B7280', 10),
          (${orgId}, 'Qualificação', 2, '#3B82F6', 25),
          (${orgId}, 'Proposta', 3, '#F59E0B', 50),
          (${orgId}, 'Negociação', 4, '#8B5CF6', 75),
          (${orgId}, 'Fechamento', 5, '#10B981', 90)
      `;
      console.log("Seeded 5 default pipeline stages");
    } else {
      console.log("Pipeline stages already exist, skipping seed");
    }

    console.log("\nDone! Login with:");
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
