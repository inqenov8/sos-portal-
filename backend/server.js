require('dotenv').config();
const express    = require('express');
const { Pool }   = require('pg');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── DATABASE ────────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

pool.query('SELECT 1')
  .then(() => console.log('[DB] PostgreSQL connected successfully'))
  .catch(err => {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  });

// ── EMAIL ───────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls:    { rejectUnauthorized: false },
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
    console.log('[EMAIL] Sent to:', to);
  } catch (e) {
    console.error('[EMAIL] Failed:', e.message);
  }
}

// ── MIDDLEWARE ──────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts. Please wait 15 minutes.' },
});

// ── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.accountType !== 'admin')
    return res.status(403).json({ error: 'Admin access required' });
  next();
}

// ── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// SIGNUP
app.post('/api/auth/signup', authLimiter, async (req, res) => {
  const { email, password, name, dept, role } = req.body;

  if (!email || !password || !name || !dept || !role)
    return res.status(400).json({ error: 'All fields are required' });

  if (!/^[^\s@]+@inq\.ng$/i.test(email))
    return res.status(400).json({ error: 'A corporate @inq.ng email address is required' });

  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });

  if (!/[A-Z]/.test(password))
    return res.status(400).json({ error: 'Password must include at least one uppercase letter' });

  if (!/[0-9]/.test(password))
    return res.status(400).json({ error: 'Password must include at least one number' });

  try {
    const exists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (exists.rows.length > 0)
      return res.status(409).json({ error: 'An account with this email already exists' });

    const hash = await bcrypt.hash(password, 12);
    const id   = uuidv4();

    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, role, dept, account_type)
       VALUES ($1, $2, $3, $4, $5, $6, 'agent')`,
      [id, email.toLowerCase(), hash, name, role, dept]
    );

    const user = {
      id,
      email: email.toLowerCase(),
      name,
      role,
      dept,
      ip: 0,
      mrc: 0,
      accountType: 'agent',
    };

    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '8h' });

    // Onboarding email
    sendEmail(
      email,
      'Welcome to the SOS Portal — inq. Nigeria',
      `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f3;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#661723;padding:40px 32px;text-align:center">
      <div style="font-family:Georgia,serif;font-size:56px;font-weight:900;color:#FF4952;line-height:1">SOS</div>
      <div style="color:rgba(255,255,255,0.6);letter-spacing:4px;font-size:11px;margin-top:6px">SELL OUR SOLUTION</div>
      <div style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:8px">inq. Nigeria · FY 2025/26</div>
    </div>
    <div style="padding:40px 32px">
      <h2 style="color:#661723;margin:0 0 16px;font-size:24px">Welcome, ${name.split(' ')[0]}!</h2>
      <p style="color:#555;line-height:1.7;margin:0 0 24px">Your SOS Portal account has been created. You can now log in and start earning inq.credible Points by completing missions.</p>
      <div style="background:#FFF0F1;border-left:4px solid #FF4952;border-radius:0 8px 8px 0;padding:20px 24px;margin:0 0 24px">
        <p style="margin:0 0 8px;font-size:13px;color:#333"><strong>Login Email:</strong> ${email}</p>
        <p style="margin:0;font-size:13px;color:#333"><strong>Portal URL:</strong> <a href="${process.env.APP_URL}" style="color:#661723">${process.env.APP_URL}</a></p>
      </div>
      <p style="color:#333;font-weight:700;margin:0 0 12px">Getting Started:</p>
      <ol style="color:#555;line-height:2;margin:0 0 32px;padding-left:20px">
        <li>Log in at <a href="${process.env.APP_URL}" style="color:#661723">${process.env.APP_URL}</a></li>
        <li>Complete the <strong>Product Training</strong> mission first</li>
        <li>Submit your first claim within 5 working days</li>
        <li>Track your IP balance in the Wallet section</li>
      </ol>
      <p style="color:#888;font-size:13px;margin:0">Questions? Contact <a href="mailto:hcm@inq.ng" style="color:#661723">hcm@inq.ng</a></p>
    </div>
    <div style="background:#f5f5f4;padding:20px 32px;text-align:center;border-top:1px solid #eee">
      <p style="color:#aaa;font-size:12px;margin:0">inq. Nigeria · SOS Campaign FY 2025/26 · This email was sent to ${email}</p>
    </div>
  </div>
</body>
</html>`
    );

    res.status(201).json({ token, user });
  } catch (e) {
    console.error('[SIGNUP]', e.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// LOGIN
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (!result.rows.length)
      return res.status(401).json({ error: 'No account found with that email address' });

    const user = result.rows[0];
    const ok   = await bcrypt.compare(password, user.password_hash);
    if (!ok)
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });

    const payload = {
      id:          user.id,
      email:       user.email,
      name:        user.name,
      role:        user.role,
      dept:        user.dept,
      accountType: user.account_type,
      ip:          user.ip_balance,
      mrc:         user.mrc,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: payload });
  } catch (e) {
    console.error('[LOGIN]', e.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// REQUEST PASSWORD RESET
app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  // Always respond success — never reveal whether email exists (security best practice)
  res.json({ message: 'If that email exists, a reset code has been sent.' });

  try {
    const { email } = req.body;
    if (!email) return;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (!result.rows.length) return;

    const user  = result.rows[0];
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const exp   = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await pool.query(
      `INSERT INTO password_resets (email, token, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE
         SET token = $2, expires_at = $3, created_at = NOW()`,
      [email.toLowerCase(), token, exp]
    );

    sendEmail(
      email,
      'SOS Portal — Password Reset Code',
      `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f3;font-family:Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#661723;padding:32px;text-align:center">
      <div style="font-family:Georgia,serif;font-size:40px;font-weight:900;color:#FF4952">SOS</div>
      <div style="color:rgba(255,255,255,0.6);font-size:14px;margin-top:4px">Password Reset</div>
    </div>
    <div style="padding:40px 32px">
      <p style="color:#333;margin:0 0 16px">Hi ${user.name.split(' ')[0]},</p>
      <p style="color:#555;margin:0 0 28px;line-height:1.6">Your 6-digit password reset code is:</p>
      <div style="background:#FFF0F1;border:2px solid #FF4952;border-radius:16px;padding:32px;text-align:center;margin:0 0 28px">
        <div style="font-family:Georgia,serif;font-size:48px;font-weight:900;color:#661723;letter-spacing:12px">${token}</div>
      </div>
      <p style="color:#888;font-size:13px;margin:0 0 8px">This code expires in <strong>30 minutes</strong>.</p>
      <p style="color:#888;font-size:13px;margin:0">If you did not request this reset, please ignore this email. Your password will not change.</p>
    </div>
    <div style="background:#f5f5f4;padding:16px 32px;text-align:center;border-top:1px solid #eee">
      <p style="color:#aaa;font-size:12px;margin:0">inq. Nigeria · SOS Portal · Internal Use Only</p>
    </div>
  </div>
</body>
</html>`
    );
  } catch (e) {
    console.error('[FORGOT]', e.message);
  }
});

// CONFIRM PASSWORD RESET
app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword)
    return res.status(400).json({ error: 'All fields are required' });

  try {
    const result = await pool.query(
      `SELECT * FROM password_resets
       WHERE email = $1 AND token = $2 AND expires_at > NOW()`,
      [email.toLowerCase(), token]
    );

    if (!result.rows.length)
      return res.status(400).json({ error: 'Invalid or expired reset code. Please request a new one.' });

    if (newPassword.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
      [hash, email.toLowerCase()]
    );
    await pool.query(
      'DELETE FROM password_resets WHERE email = $1',
      [email.toLowerCase()]
    );

    res.json({ message: 'Password updated successfully. You can now sign in.' });
  } catch (e) {
    console.error('[RESET]', e.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// DATA ROUTES (all require authentication)
// ══════════════════════════════════════════════════════════════════════════════

// Load all portal data for the logged-in session
app.get('/api/data', authMiddleware, async (req, res) => {
  try {
    const [agents, missions, redemptions, announcements] = await Promise.all([
      pool.query(`
        SELECT id, name, role, dept, ip_balance AS ip, mrc
        FROM users
        WHERE account_type = 'agent'
        ORDER BY name
      `),
      pool.query(`
        SELECT
          id,
          agent_id        AS "agentId",
          mission_id      AS "missionId",
          cat, name, ip, status,
          deal_ref        AS "dealRef",
          notes, evidence,
          reject_reason   AS "rejectReason",
          submitted_date  AS date
        FROM missions
        ORDER BY created_at DESC
      `),
      pool.query(`
        SELECT
          item_id         AS "itemId",
          agent_id        AS "agentId",
          status,
          redeemed_at::date AS date
        FROM redemptions
        ORDER BY redeemed_at DESC
      `),
      pool.query(`
        SELECT id, title, body, author, pinned,
               created_at::date AS date
        FROM announcements
        ORDER BY pinned DESC, created_at DESC
      `),
    ]);

    res.json({
      agents:        agents.rows,
      missions:      missions.rows,
      redemptions:   redemptions.rows,
      announcements: announcements.rows,
    });
  } catch (e) {
    console.error('[DATA]', e.message);
    res.status(500).json({ error: 'Failed to load portal data' });
  }
});

// ── MISSIONS ──────────────────────────────────────────────────────────────────

// Submit a mission claim
app.post('/api/missions', authMiddleware, async (req, res) => {
  const { missionId, cat, name, ip, dealRef, notes, evidence } = req.body;
  if (!missionId || !cat || !name || !ip)
    return res.status(400).json({ error: 'Missing required mission fields' });

  const id = 'MS-' + uuidv4().split('-')[0].toUpperCase();
  try {
    await pool.query(
      `INSERT INTO missions
         (id, agent_id, mission_id, cat, name, ip, deal_ref, notes, evidence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, req.user.id, missionId, cat, name, ip, dealRef || null, notes, evidence || null]
    );
    res.status(201).json({ id, message: 'Mission submitted successfully' });
  } catch (e) {
    console.error('[MISSION SUBMIT]', e.message);
    res.status(500).json({ error: 'Failed to submit mission' });
  }
});

// Approve a mission (admin only) — atomic transaction
app.patch('/api/missions/:id/approve', authMiddleware, adminOnly, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const m = await client.query(
      'SELECT * FROM missions WHERE id = $1 FOR UPDATE',
      [req.params.id]
    );
    if (!m.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Mission not found' });
    }

    const mission = m.rows[0];
    if (mission.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Mission is not pending' });
    }

    await client.query(
      "UPDATE missions SET status = 'approved' WHERE id = $1",
      [req.params.id]
    );
    await client.query(
      'UPDATE users SET ip_balance = ip_balance + $1, updated_at = NOW() WHERE id = $2',
      [mission.ip, mission.agent_id]
    );

    await client.query('COMMIT');
    res.json({ message: `Approved. ${mission.ip} IP credited to agent.` });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[APPROVE]', e.message);
    res.status(500).json({ error: 'Failed to approve mission' });
  } finally {
    client.release();
  }
});

// Reject a mission (admin only)
app.patch('/api/missions/:id/reject', authMiddleware, adminOnly, async (req, res) => {
  const { reason } = req.body;
  if (!reason?.trim())
    return res.status(400).json({ error: 'A rejection reason is required' });

  try {
    const result = await pool.query(
      "UPDATE missions SET status = 'rejected', reject_reason = $1 WHERE id = $2 AND status = 'pending'",
      [reason, req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Mission not found or already processed' });

    res.json({ message: 'Mission rejected. Agent has been notified.' });
  } catch (e) {
    console.error('[REJECT]', e.message);
    res.status(500).json({ error: 'Failed to reject mission' });
  }
});

// ── MARKETPLACE ───────────────────────────────────────────────────────────────

// Redeem a marketplace item — atomic transaction
app.post('/api/redemptions', authMiddleware, async (req, res) => {
  const { itemId, ipCost } = req.body;
  if (!itemId || !ipCost)
    return res.status(400).json({ error: 'Item ID and IP cost are required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const u = await client.query(
      'SELECT ip_balance FROM users WHERE id = $1 FOR UPDATE',
      [req.user.id]
    );
    if (!u.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }
    if (u.rows[0].ip_balance < ipCost) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient IP balance' });
    }

    await client.query(
      'UPDATE users SET ip_balance = ip_balance - $1, updated_at = NOW() WHERE id = $2',
      [ipCost, req.user.id]
    );
    await client.query(
      'INSERT INTO redemptions (item_id, agent_id) VALUES ($1, $2)',
      [itemId, req.user.id]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Redeemed successfully' });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[REDEEM]', e.message);
    res.status(500).json({ error: 'Redemption failed. Please try again.' });
  } finally {
    client.release();
  }
});

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────

// Add announcement (admin only)
app.post('/api/announcements', authMiddleware, adminOnly, async (req, res) => {
  const { title, body } = req.body;
  if (!title?.trim() || !body?.trim())
    return res.status(400).json({ error: 'Title and message are required' });

  const id = 'AN-' + uuidv4().split('-')[0].toUpperCase();
  try {
    await pool.query(
      'INSERT INTO announcements (id, title, body, author) VALUES ($1, $2, $3, $4)',
      [id, title, body, req.user.name]
    );
    res.status(201).json({ id, message: 'Announcement published' });
  } catch (e) {
    console.error('[ANNOUNCE]', e.message);
    res.status(500).json({ error: 'Failed to publish announcement' });
  }
});

// ── ADMIN UTILITIES ───────────────────────────────────────────────────────────

// Test email configuration (admin only)
app.post('/api/admin/test-email', authMiddleware, adminOnly, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email address required' });
  try {
    await transporter.verify();
    await sendEmail(
      email,
      'SOS Portal — Email Configuration Test',
      '<div style="font-family:Arial;padding:32px"><h2 style="color:#661723">Email Working</h2><p>Your SOS Portal email configuration is working correctly.</p></div>'
    );
    res.json({ message: 'Test email sent successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Email failed: ' + e.message });
  }
});

// Get platform statistics (admin only)
app.get('/api/admin/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [users, missions, redemptions] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total FROM users WHERE account_type = 'agent'"),
      pool.query("SELECT status, COUNT(*) AS count FROM missions GROUP BY status"),
      pool.query("SELECT COUNT(*) AS total FROM redemptions"),
    ]);
    res.json({
      totalAgents:    parseInt(users.rows[0].total),
      missionStats:   missions.rows,
      totalRedemptions: parseInt(redemptions.rows[0].total),
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// ── START SERVER ──────────────────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[SERVER] SOS Portal API running on port ${PORT}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV}`);
  console.log(`[SERVER] Health check: http://127.0.0.1:${PORT}/api/health`);
});
