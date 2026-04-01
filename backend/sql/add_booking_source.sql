-- Run once on existing DBs: adds PRD booking source for analytics.
-- Prisma mirror: reservations.booking_source

ALTER TABLE reservations
  ADD COLUMN booking_source VARCHAR(50) NOT NULL DEFAULT 'WEBSITE' AFTER payment_status;

CREATE INDEX idx_reservations_booking_source ON reservations (booking_source);
