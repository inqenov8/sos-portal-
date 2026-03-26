# SOS Portal — inq. Nigeria

**Sell Our Solution** · Internal incentive platform for non-sales staff · FY 2025/26

---

## Project Structure

```
sos-portal/
├── backend/
│   ├── server.js              # Node.js API server (Express + PostgreSQL)
│   ├── package.json           # Backend dependencies
│   ├── schema.sql             # Database tables (run once to set up)
│   ├── .env.example           # Environment variable template → copy to .env
│   └── scripts/
│       └── seed-admin.js      # Creates the first admin account
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx            # Root component + API wiring instructions
│   │   ├── SOSPortal.jsx      # All UI components
│   │   └── api.js             # Backend API client
│   ├── index.html             # HTML shell
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Build configuration
│
├── nginx/
│   └── sosportal.conf         # Nginx site configuration (copy to server)
│
├── ecosystem.config.cjs       # PM2 process manager configuration
├── backup.sh                  # Database backup script
├── .gitignore
└── README.md
```

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm

### 1. Clone and install

```bash
git clone https://github.com/your-org/sos-portal.git
cd sos-portal

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Set up the database

```bash
# Create the database (run as postgres user)
sudo -i -u postgres psql -c "CREATE USER sosapp WITH PASSWORD 'localdevpass';"
sudo -i -u postgres psql -c "CREATE DATABASE sosportal OWNER sosapp;"

# Create the tables
sudo -i -u postgres psql -d sosportal -f backend/schema.sql
```

### 3. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and fill in your values
nano backend/.env
```

Minimum required for local development:
```
DATABASE_URL=postgresql://sosapp:localdevpass@localhost:5432/sosportal
PORT=3001
NODE_ENV=development
JWT_SECRET=any-long-random-string-for-dev
```

### 4. Create the admin account

```bash
cd backend
ADMIN_EMAIL=admin@inq.ng ADMIN_PASSWORD=Admin123! node scripts/seed-admin.js
```

### 5. Start the servers

```bash
# Terminal 1 — Backend
cd backend && npm start

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Production Deployment

See the full **SOS Production Deployment Guide** (Word document) for step-by-step instructions covering:

- VM specifications
- Ubuntu 24.04 server setup
- PostgreSQL configuration
- Nginx with HTTPS
- PM2 process management
- Automated backups
- Security checklist

### Quick production commands

```bash
# Build the frontend for production
cd frontend && npm run build

# Start with PM2
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup

# Check everything is running
pm2 status
curl http://127.0.0.1:3001/api/health
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `PORT` | ✅ | Backend server port (default: 3001) |
| `NODE_ENV` | ✅ | `development` or `production` |
| `JWT_SECRET` | ✅ | Random 64-char string for session signing |
| `SMTP_HOST` | ✅ | SMTP server hostname |
| `SMTP_PORT` | ✅ | SMTP port (usually 587) |
| `SMTP_USER` | ✅ | Email account username |
| `SMTP_PASS` | ✅ | Email account password |
| `EMAIL_FROM` | ✅ | Sender name and address |
| `APP_URL` | ✅ | Portal URL (used in email links) |

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Server health check |
| POST | `/api/auth/signup` | No | Register new user |
| POST | `/api/auth/login` | No | Sign in |
| POST | `/api/auth/forgot-password` | No | Request reset code |
| POST | `/api/auth/reset-password` | No | Confirm reset |
| GET | `/api/data` | Agent/Admin | Load all portal data |
| POST | `/api/missions` | Agent | Submit a mission claim |
| PATCH | `/api/missions/:id/approve` | Admin | Approve a mission |
| PATCH | `/api/missions/:id/reject` | Admin | Reject a mission |
| POST | `/api/redemptions` | Agent | Redeem marketplace item |
| POST | `/api/announcements` | Admin | Publish announcement |
| POST | `/api/admin/test-email` | Admin | Test email config |
| GET | `/api/admin/stats` | Admin | Platform statistics |

---

## Security Notes

- All passwords are hashed with bcrypt (12 rounds)
- Sessions use signed JWT tokens (8-hour expiry)
- Rate limiting on all auth endpoints (20 requests / 15 minutes)
- Only `@inq.ng` email addresses can register
- The server only listens on `127.0.0.1` — Nginx is the only public entry point
- The `.env` file must never be committed to git

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| UI Components | lucide-react |
| Backend | Node.js + Express |
| Database | PostgreSQL 15 |
| Auth | bcryptjs + JWT |
| Email | Nodemailer |
| Web server | Nginx |
| Process manager | PM2 |
| OS | Ubuntu 24.04 LTS |

---

## Support

Internal tool — contact **hcm@inq.ng** for access issues.
