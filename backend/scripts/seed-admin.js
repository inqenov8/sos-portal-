/**
 * SOS Portal — Admin Account Seeder
 * 
 * Run ONCE after setting up the database to create the first admin account.
 * Usage:
 *   cd backend
 *   node scripts/seed-admin.js
 * 
 * Set these environment variables in your .env before running:
 *   ADMIN_EMAIL=hcm.admin@inq.ng
 *   ADMIN_PASSWORD=YourAdminPassword123!
 *   ADMIN_NAME=HCM Admin
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');
const bcrypt   = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedAdmin() {
  const email    = process.env.ADMIN_EMAIL    || 'hcm.admin@inq.ng';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const name     = process.env.ADMIN_NAME     || 'HCM Admin';

  console.log('[SEED] Connecting to database...');
  await pool.query('SELECT 1');
  console.log('[SEED] Connected.');

  const exists = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (exists.rows.length > 0) {
    console.log(`[SEED] Admin account already exists: ${email}`);
    await pool.end();
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const id   = uuidv4();

  await pool.query(
    `INSERT INTO users (id, email, password_hash, name, role, dept, account_type)
     VALUES ($1, $2, $3, $4, 'HCM Administrator', 'HCM', 'admin')`,
    [id, email.toLowerCase(), hash, name]
  );

  console.log('[SEED] ✅ Admin account created successfully');
  console.log(`[SEED]    Email:    ${email}`);
  console.log(`[SEED]    Password: ${password}`);
  console.log('[SEED]    ⚠  Change this password immediately after first login!');

  await pool.end();
}

seedAdmin().catch(e => {
  console.error('[SEED] Error:', e.message);
  process.exit(1);
});
