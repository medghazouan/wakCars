const { test, describe } = require('node:test');
const assert = require('node:assert');
const { generateReservationPDF, generateInvoicePDF } = require('./pdf.service');

const minimalReservation = {
  id: 1,
  total_amount: 1500,
  pickup_date: new Date('2026-06-01T10:00:00Z'),
  dropoff_date: new Date('2026-06-05T10:00:00Z'),
  has_gps: false,
  has_child_seat: false,
  payment_status: 'UNPAID',
  car: {
    brand: 'Test',
    model: 'Car',
    year: 2024,
    license_plate: 'A-1-TEST',
    fuel_type: 'DIESEL',
    transmission: 'MANUAL',
  },
  customer: {
    first_name: 'Jean',
    last_name: 'Dupont',
    phone: '+212612345678',
    email: 'jean@example.com',
  },
  pickup_location: { name_fr: 'Agence' },
  dropoff_location: { name_fr: 'Aéroport' },
};

describe('pdf.service', () => {
  test('generateReservationPDF returns a PDF buffer', async () => {
    const buf = await generateReservationPDF(minimalReservation);
    assert.ok(Buffer.isBuffer(buf));
    assert.strictEqual(buf.slice(0, 4).toString(), '%PDF');
  });

  test('generateInvoicePDF returns a PDF buffer', async () => {
    const payments = [
      {
        amount: 1500,
        method: 'CASH',
        created_at: new Date('2026-06-05T12:00:00Z'),
        reference: null,
      },
    ];
    const buf = await generateInvoicePDF(minimalReservation, payments);
    assert.ok(Buffer.isBuffer(buf));
    assert.strictEqual(buf.slice(0, 4).toString(), '%PDF');
  });
});
