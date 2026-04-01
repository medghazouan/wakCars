# Tests — new features (email attachments & admin WhatsApp links)

## Automated tests

Run from each package directory:

```bash
# Frontend — Vitest (`whatsappLinks.js` URL builders)
cd frontend && npm run test
```

```bash
# Backend — Node built-in test runner (`whatsapp.service`, `pdf.service`)
cd backend && npm run test
```

**What is covered**

| Area | Tests |
|------|--------|
| Admin WhatsApp URLs | French templates, `wa.me` host, phone normalization (`0…` → `212…`), query `text=` encoding |
| PDF generation | `generateReservationPDF` / `generateInvoicePDF` return buffers starting with `%PDF` |

**Not covered automatically** (requires SMTP + DB + Cloudinary): Nodemailer sends, attachment fetch from Cloudinary URLs, reservation status → invoice email. Use the manual checklist below in staging.

---

## Why emails might not arrive

1. **`RESEND_API_KEY` in `backend/.env`** — Without it, the API skips sending and logs:  
   `[email] RESEND_API_KEY is not set — cannot send confirmation email`.  
   Add a real key from [Resend](https://resend.com) and restart the backend.

2. **`EMAIL_FROM` domain** — Must be a domain verified in Resend (SPF/DNS). Using an unverified `noreply@…` address will cause SMTP rejection; check backend logs for `Email failed to …`.

3. **Customer email** — Confirmation and invoice require `customer.email` on the reservation. Guest bookings must include an email if you want mail.

4. **Watch server logs** — Failures are logged as `Confirmation email failed for #…` or `Invoice email failed for #…` (no longer silent).

---

## Manual use cases (QA)

Prerequisites: `RESEND_API_KEY` (or equivalent SMTP), customer email on reservation, Cloudinary configured for damage uploads.

**Booking status (including COMPLETED)** — In **Admin → Reservations → List view**, use the **Booking status** column dropdown: `PENDING` → `CONFIRMED` → `ACTIVE` → `COMPLETED`, etc. You do not need to do anything else first except a valid reservation and (for emails) the items above. **Confirm** is still a shortcut for `PENDING` → `CONFIRMED` only.

### 1. Confirmation email + PDF

1. Create or use a reservation with a **customer email**.
2. Set status to **CONFIRMED** (or use **Confirm** flow).
3. Open the customer inbox.
4. **Expect:** email with subject containing confirmation; **attachment** `confirmation-{id}.pdf` opens and shows reservation summary.

### 2. Invoice email on completion

1. Same reservation: record payments if needed so workflow makes sense.
2. Set status to **COMPLETED**.
3. **Expect:** email with subject `Facture réservation #…`; **attachment** `facture-{id}.pdf`.

### 3. Damage report email + photos

1. Create a damage report with **reservation** + **customer email**, upload **at least one image**, enable **notify customer** (or use **Notify** after save).
2. **Expect:** email with description; **image attachments** (or verify SMTP provider accepts `path` URLs — if not, switch to buffer-based attachments in code).

### 4. Admin WhatsApp links

1. Open **Dashboard** alerts: overdue / unpaid — **WhatsApp** should open with **pre-filled French text** (not a blank chat).
2. Open **Nav** alerts bell — same for overdue; unpaid row should show **WA** with payment message.
3. Edit a reservation with a **linked customer phone** — **WhatsApp — messages pré-remplis** buttons should each open `wa.me` with the correct template.

### 5. Regression

1. Admin **new reservation** with `booking_source` set — saves without server error (uses `booking_source` from body).

---

*Keep automated tests green in CI by running `npm run test` in `frontend` and `backend` after changes to `whatsappLinks.js`, `whatsapp.service.js`, or `pdf.service.js`.*
