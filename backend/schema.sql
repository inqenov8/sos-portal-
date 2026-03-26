-- ─────────────────────────────────────────────────────────────────────────────
-- SOS Portal — PostgreSQL Database Schema
-- Run this file to create all tables:
--   sudo -i -u postgres psql -d sosportal -f schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Users (agents and admins)
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(64)  PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  role          VARCHAR(255) NOT NULL DEFAULT 'Agent',
  dept          VARCHAR(255) NOT NULL DEFAULT 'General',
  ip_balance    INTEGER      NOT NULL DEFAULT 0,
  mrc           BIGINT       NOT NULL DEFAULT 0,
  account_type  VARCHAR(20)  NOT NULL DEFAULT 'agent' CHECK (account_type IN ('agent', 'admin')),
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Mission submissions
CREATE TABLE IF NOT EXISTS missions (
  id             VARCHAR(64)  PRIMARY KEY,
  agent_id       VARCHAR(64)  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id     VARCHAR(20)  NOT NULL,
  cat            VARCHAR(100) NOT NULL,
  name           VARCHAR(255) NOT NULL,
  ip             INTEGER      NOT NULL DEFAULT 0,
  status         VARCHAR(20)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  deal_ref       VARCHAR(100),
  notes          TEXT,
  evidence       VARCHAR(500),
  reject_reason  TEXT,
  submitted_date DATE         NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Marketplace redemptions
CREATE TABLE IF NOT EXISTS redemptions (
  id          SERIAL       PRIMARY KEY,
  item_id     VARCHAR(20)  NOT NULL,
  agent_id    VARCHAR(64)  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      VARCHAR(20)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'fulfilled')),
  redeemed_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id         VARCHAR(64)  PRIMARY KEY,
  title      VARCHAR(500) NOT NULL,
  body       TEXT         NOT NULL,
  author     VARCHAR(255) NOT NULL DEFAULT 'HCM Admin',
  pinned     BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  email      VARCHAR(255) PRIMARY KEY,
  token      VARCHAR(10)  NOT NULL,
  expires_at TIMESTAMP    NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── INDEXES ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_missions_agent_id  ON missions(agent_id);
CREATE INDEX IF NOT EXISTS idx_missions_status    ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_date      ON missions(submitted_date);
CREATE INDEX IF NOT EXISTS idx_redemptions_agent  ON redemptions(agent_id);
CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);

-- ── PERMISSIONS ───────────────────────────────────────────────────────────────
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO sosapp;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sosapp;

-- ── SEED DATA ─────────────────────────────────────────────────────────────────
-- Default announcements (optional — remove if not wanted)
INSERT INTO announcements (id, title, body, author, pinned) VALUES
  ('AN-SEED-1',
   'SOS Campaign FY2025/26 — Now Live!',
   'Welcome to the SOS Campaign! All eligible non-sales staff can log in, complete mandatory training, and start earning inq.credible Points. The portal is open. Your first claim can be submitted today. Good luck, Agents!',
   'HCM Team',
   TRUE),
  ('AN-SEED-2',
   'Q1 Recognition Event — Save the Date',
   'The Q1 SOS Recognition Event takes place on 3 July 2025. Four category winners will be announced — Churn Rescue, Brand Enforcer, Opportunity Scout, and Support Wingman. Each winner receives a 500 IP bonus. Keep pushing!',
   'HCM Team',
   FALSE),
  ('AN-SEED-3',
   'Priority Products — Edge AI & Edge Sentry',
   'Support missions tied to Edge AI and Edge Sentry will be fast-tracked in the approval queue this quarter. Speak to your Account Manager to get involved.',
   'Innovation & Partnerships',
   FALSE)
ON CONFLICT (id) DO NOTHING;
