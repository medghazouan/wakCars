# Wak Cars — Backend API

Express.js + Prisma + MariaDB admin backend for Wak Cars car rental management.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 4 |
| ORM | Prisma 5 (MySQL/MariaDB) |
| Auth | JWT (15min access) + Refresh token rotation (7 days, HttpOnly cookie) |
| Email | Nodemailer + Resend SMTP |
| File uploads | Multer (memory) → Cloudinary |
| PDF | PDFKit |
| Scheduler | node-cron |
| Logging | Winston |
| Error tracking | Sentry |

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your values
```

### 3. Set up the database
```bash
# Import the schema into your MariaDB:
mysql -u root -p < ../wakcars_schema.sql

# Generate Prisma client from the schema:
npm run prisma:generate

# Optional — push schema changes (dev only):
npm run prisma:push
```

### 4. Run the server
```bash
npm run dev     # development (nodemon)
npm start       # production
```

## API Overview

All admin routes require `Authorization: Bearer <access_token>`.

| Group | Base Path |
|---|---|
| Auth | `POST /api/auth/login` |
| Dashboard | `GET /api/dashboard` |
| Cars | `/api/cars` |
| Categories | `/api/categories` |
| Locations | `/api/locations` |
| Customers | `/api/customers` |
| Reservations | `/api/reservations` |
| Payments | `/api/payments` |
| Insurance | `/api/insurance` |
| Technical Visits | `/api/technical-visits` |
| Damage Reports | `/api/damages` |
| Blog | `/api/blog` |
| FAQs | `/api/faqs` |
| Settings | `/api/settings` |
| Alerts | `GET /api/alerts` |
| Reports | `/api/reports/revenue` · `/api/reports/utilization` · `/api/reports/export` |
| Cron trigger | `POST /api/cron/run-jobs` (X-Cron-Secret header) |
| Health | `GET /health` |

## Deployment (Hostinger)

1. Push to GitHub
2. In hPanel → Node.js Web App → connect GitHub repo
3. Set all environment variables in hPanel's env manager
4. Entry point: `src/server.js`
5. Node.js version: latest LTS

## Amounts

All monetary amounts are in **MAD (Moroccan Dirham)**.
