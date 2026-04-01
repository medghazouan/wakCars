# PRD implementation verification (RentaCar PRD v1.2)

**Reference document:** `RentaCar_PRD_v1_2.md` (Product Requirements Document v1.2 — Hostinger-first stack)  
**Codebase reviewed:** Wak Cars monorepo (`frontend/`, `backend/`)  
**Verification date:** 2026-04-01  

This report maps PRD requirements to what exists in the repository today. Status labels:

| Status | Meaning |
|--------|---------|
| **Implemented** | Behavior or structure clearly present and aligned with the PRD |
| **Partial** | Core idea exists but differs in scope, wiring, or completeness |
| **Gap** | Required by PRD, missing or not connected |
| **N/A / Out of scope** | Explicitly excluded in PRD §12 or not applicable |

---

## 1. Overview & stack (PRD §1, §5)

| Requirement | Status | Notes |
|-------------|--------|--------|
| React + Vite + Tailwind (frontend) | **Implemented** | Vite + Tailwind; admin and marketing site |
| Express.js backend | **Implemented** | `backend/src/app.js`, modular routes |
| MariaDB + Prisma | **Implemented** | `schema.prisma` provider `mysql` (MariaDB-compatible) |
| JWT access + refresh rotation | **Implemented** | `auth.controller.js`, `utils/jwt.js`; defaults `15m` / `7d` in `config/env.js` |
| Nodemailer + Resend SMTP | **Implemented** | `services/email.service.js`, Resend env vars |
| PDFKit (no Puppeteer) | **Implemented** | `services/pdf.service.js` |
| node-cron in process | **Implemented** | `services/cron.service.js`, `initCronJobs()` from `server.js` |
| Secondary HTTP cron trigger | **Implemented** | `POST /api/cron/run-jobs` with `x-cron-secret` (`cron.controller.js`) |
| Multer + Cloudinary uploads | **Implemented** | `middleware/upload.js`, `services/cloudinary.service.js` |
| Sentry | **Partial** | Initialized in `server.js` when `SENTRY_DSN` is set |
| Winston logging | **Implemented** | `utils/logger.js`, request logging in `app.js` |
| express-validator | **Implemented** | Validators under `validators/`, `middleware/validate.js` |
| express-rate-limit | **Implemented** | `config/rateLimiter.js`; public API `100` / 15 min |
| bcrypt password hashing | **Implemented** | `bcryptjs`; seed script uses cost `12` |
| Hosting/deployment specifics (Vercel, Hostinger hPanel) | **N/A** | Operational; not verifiable from source alone |

---

## 2. User roles (PRD §2)

| Requirement | Status | Notes |
|-------------|--------|--------|
| Admin/staff dashboard | **Implemented** | `/admin` SPA with JWT-protected layout |
| Guest customers (no login) | **Implemented** | Public booking flow; `public.controller.js` `guestReservation` |

---

## 3. Core features (PRD §3)

| Feature | Status | Notes |
|---------|--------|--------|
| Car rental catalog (browse, filter, detail) | **Implemented** | Site pages + `public` APIs for cars/categories |
| Reservation system (dates, locations, payments tracking) | **Implemented** | Reservations + payments models and admin UI |
| Admin-only auth (JWT + refresh) | **Implemented** | See §1 |
| Admin dashboard (stats/analytics) | **Implemented** | `dashboard.controller.js`, `DashboardPage.jsx` |
| Car management | **Implemented** | Fleet admin pages + `cars` API |
| Insurance tracking | **Implemented** | `insurance_policies`, admin UI, expiry handling in cron |
| Maintenance / technical visits | **Implemented** | `technical_visits` (PRD wording “maintenance logging”) |
| Reservation management | **Implemented** | List/form, status updates, confirm flow |
| Client management | **Implemented** | `customers` + admin UI |
| Auto-status updates (availability, insurance, reservation progress) | **Partial** | Cron updates insurance expiry; reservation status drives car `RENTED`/`AVAILABLE`; not every edge case automated |

---

## 4. New features — email (PRD §4.1)

| Requirement | Status | Notes |
|-------------|--------|--------|
| Booking confirmation email | **Partial** | `sendReservationConfirmation` sends HTML summary; **PDF attachment not sent** despite `generateReservationPDF` in `pdf.service.js` |
| PDF summary on booking (PDFKit) | **Gap** | Generator exists; **not attached or invoked** from confirmation flow |
| Invoice PDF on rental completion + email | **Gap** | `generateInvoicePDF` + `sendInvoice` exist in services but **no controller wires them** when status → `COMPLETED` |
| Damage report email | **Partial** | `sendDamageNotification` sends description/cost; **photos are not attached** (PRD: “includes photos”) |

---

## 5. New features — WhatsApp click-to-chat (PRD §4.2)

| Requirement | Status | Notes |
|-------------|--------|--------|
| Pre-filled templates (pickup, return, overdue, payment, inquiry, support) | **Partial** | `services/whatsapp.service.js` defines URL builders for all listed templates |
| UI/actions using those templates | **Gap** | Helpers are **not imported** elsewhere; admin alert WhatsApp links use `wa.me` **without** encoded template text (`DashboardAlerts.jsx`, `NavAlertsBell.jsx`) |
| Customer → business (inquiry / support) | **Partial** | Site `WhatsAppButton`, `BookingConfirm` / `generateWhatsAppLink` use messages; not all PRD labels exposed as discrete staff actions |

---

## 6. Admin tools (PRD §4.3)

| Tool | Status | Notes |
|------|--------|--------|
| Alert panel (overdue, maintenance due, unpaid, expiring insurance) | **Partial** | `/api/alerts` + dashboard: overdue, insurance, unpaid, damages; **technical visit / maintenance alerts excluded in UI** (comment in `DashboardAlerts.jsx`: “omitted by product request”) — **differs from PRD** |
| Damage tool + Cloudinary photos | **Implemented** | `damages` routes with `upload.array`, email notify path |
| Vehicle reassignment | **Implemented** | `PATCH /api/reservations/:id/reassign`, admin form |
| Manual payment recording | **Implemented** | `payments.controller.js` `create` with `recorded_by_id` |

---

## 7. Reporting (PRD §4.4)

| Report | Status | Notes |
|--------|--------|--------|
| Revenue (periods, charts) | **Implemented** | `reports.controller.js` `revenue`, charts on `ReportsPage.jsx` |
| Fleet utilization | **Implemented** | `utilization` endpoint + UI table |
| Booking source | **Implemented** | `bookingSources`, `booking_source` on `reservations`, site/admin normalization |
| Export CSV / PDF | **Implemented** | `GET /api/reports/export` for revenue, utilization, `booking_sources` |

---

## 8. Security (PRD §7)

| Requirement | Status | Notes |
|-------------|--------|--------|
| bcrypt | **Implemented** | See auth flow |
| JWT + refresh rotation | **Implemented** | |
| express-validator | **Implemented** | |
| Rate limiting | **Implemented** | Public 100/15min; auth login limited |
| HTTPS | **N/A** | Platform |
| File upload: MIME + size (5MB) | **Implemented** | `middleware/upload.js` |
| file-type (magic byte) validation | **Gap** | PRD lists `file-type`; **not in `package.json`** — MIME is from client only |
| Prisma / SQL injection | **Implemented** | Prisma ORM |
| CORS whitelist | **Implemented** | `config/cors.js` + `CORS_ORIGIN` |
| No stack traces to client in production | **Partial** | `errorHandler.js` hides message for 500 in production; non-500 errors may still expose `err.message` |

---

## 9. Observability (PRD §8)

| Tool | Status | Notes |
|------|--------|--------|
| Sentry | **Partial** | Optional via env |
| Winston | **Implemented** | |
| Hostinger logs | **N/A** | Ops |

---

## 10. Database indexes (PRD §9)

| PRD index | Status | Notes |
|-----------|--------|--------|
| `bookings.car_id` | **Implemented** | `reservations@@index([car_id])` |
| `bookings.status` | **Implemented** | `@@index([status])` |
| `bookings.return_date` (overdue) | **Partial** | Schema uses `dropoff_date` + `actual_return_date`; **`@@index([dropoff_date])`** present |
| `bookings.customer_phone` | **Partial** | Phone stored on `customers.phone` with `@@index([phone])`; no denormalized column |
| `bookings.source` | **Implemented** | Field `booking_source` + index |
| `cars.status` | **Implemented** | |
| `insurance_policies.expiry_date` | **Implemented** | |
| `maintenance_logs.scheduled_date` | **Partial** | Modeled as `technical_visits`; **`@@index([car_id])` only** — no index on `expiration_date` / visit date for report-style scans |

---

## 11. Non-functional (PRD §11)

| Topic | Status | Notes |
|-------|--------|--------|
| French + Arabic RTL | **Partial** | `tailwindcss-rtl`, `dir` on `documentElement` for site and admin language hooks; not every view audited |
| Responsive UI | **Implemented** | Tailwind breakpoints across site/admin |
| Performance / load / email SLA | **N/A** | Requires runtime monitoring |

---

## 12. Out of scope (PRD §12)

Customer accounts, online card gateway, native app, WhatsApp Business API automation, multi-branch, GPS tracking, Puppeteer — **no conflicting features observed** in scope of the PRD exclusions.

---

## 13. Critical issues found during verification

1. **Admin reservation `create` — `booking_source`**  
   `reservations.controller.js` passes `normalizeBookingSource(rawSource)` but **`rawSource` is not destructured from `req.body`**. This is a **runtime bug** (ReferenceError) on that code path and should be fixed by adding e.g. `booking_source: rawSource` to the destructuring list.

2. **Email/PDF PRD gaps**  
   Confirmation email does not attach the PDFKit summary; completion invoice email+PDF is not triggered; damage email does not include photo attachments.

3. **WhatsApp template helpers**  
   Implemented as pure functions but **not integrated** into admin workflows, so PRD “every action generates a pre-filled link” is only partially met (site + generic links).

4. **Alert panel vs PRD**  
   Maintenance-due surfacing is explicitly reduced in the dashboard component; reconcile with PRD if full parity is required.

5. **`file-type` package**  
   Listed in PRD security table; not present — optional hardening step.

---

## 14. Summary scorecard

| Area | Approx. coverage |
|------|------------------|
| Stack & infrastructure | High |
| Core rental/admin features | High |
| Reporting & booking source | High |
| Email + PDF (PRD detail) | Low–medium (services exist, wiring incomplete) |
| WhatsApp (template coverage in UI) | Medium |
| Security hardening (file-type, error messages) | Medium |
| DB indexes | High with minor gaps |

**Overall:** The project implements the majority of **structural** PRD items (stack, auth, CRUD, reports, alerts API, cron, uploads, rate limits). The largest **documentation-vs-code** gaps are **email attachments (confirmation PDF, invoice on completion, damage photos)** and **use of centralized WhatsApp message builders in the admin UI**. One **confirmed code defect** affects admin reservation creation and `booking_source` handling.

---

*Generated for internal tracking; update this file when major features ship or the PRD changes.*
