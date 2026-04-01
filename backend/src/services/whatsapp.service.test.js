const { test, describe } = require('node:test');
const assert = require('node:assert');

// Force stable business phone for assertions (module reads env at load)
process.env.WHATSAPP_BUSINESS_PHONE = '+212600000000';
delete require.cache[require.resolve('./whatsapp.service')];
const whatsapp = require('./whatsapp.service');

describe('whatsapp.service', () => {
  const customer = { first_name: 'Ali', phone: '0612345678' };
  const reservation = {
    id: 42,
    pickup_date: '2026-05-10T10:00:00.000Z',
    dropoff_date: '2026-05-15T18:00:00.000Z',
  };

  test('normalizePhoneForWa maps leading 0 to 212', () => {
    assert.strictEqual(whatsapp.normalizePhoneForWa('0612345678'), '212612345678');
  });

  test('pickupReminder returns wa.me with encoded French message', () => {
    const url = whatsapp.pickupReminder(customer, reservation);
    assert.match(url, /^https:\/\/wa\.me\/212612345678\?text=/);
    const text = decodeURIComponent(url.split('text=')[1]);
    assert.ok(text.includes('Ali'));
    assert.ok(text.includes('#42'));
  });

  test('customerInquiry targets business phone from env', () => {
    const url = whatsapp.customerInquiry();
    assert.ok(url.includes('wa.me/212600000000'));
  });

  test('customerSupport includes reservation id in message', () => {
    const url = whatsapp.customerSupport(7);
    const text = decodeURIComponent(url.split('text=')[1]);
    assert.ok(text.includes('#7'));
  });
});
