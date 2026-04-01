import { describe, it, expect } from 'vitest'
import {
  normalizePhoneForWa,
  buildLink,
  pickupReminder,
  returnReminder,
  overdueReturn,
  paymentIssue,
  customerInquiry,
  customerSupport,
} from './whatsappLinks.js'

describe('normalizePhoneForWa', () => {
  it('strips non-digits', () => {
    expect(normalizePhoneForWa('+212 6 12 34 56 78')).toBe('212612345678')
  })

  it('maps leading 0 to Morocco country code', () => {
    expect(normalizePhoneForWa('0612345678')).toBe('212612345678')
  })
})

describe('buildLink', () => {
  it('builds wa.me URL with encoded message', () => {
    const url = buildLink('0612345678', 'Hello & test')
    expect(url).toMatch(/^https:\/\/wa\.me\/212612345678\?text=/)
    expect(decodeURIComponent(url.split('text=')[1])).toBe('Hello & test')
  })
})

const customer = { first_name: 'Ali', phone: '0612345678' }
const reservation = {
  id: 42,
  pickup_date: '2026-05-10T10:00:00.000Z',
  dropoff_date: '2026-05-15T18:00:00.000Z',
}

describe('staff → customer templates', () => {
  it('pickupReminder includes reservation id and encodes text', () => {
    const url = pickupReminder(customer, reservation)
    expect(url).toContain('wa.me/212612345678?text=')
    const text = decodeURIComponent(url.split('text=')[1])
    expect(text).toContain('Ali')
    expect(text).toContain('#42')
    expect(text).toContain('Wak Cars')
  })

  it('returnReminder targets customer phone', () => {
    const url = returnReminder(customer, reservation)
    expect(url).toMatch(/^https:\/\/wa\.me\/212612345678\?text=/)
    expect(decodeURIComponent(url.split('text=')[1])).toContain('retour')
  })

  it('overdueReturn references reservation id', () => {
    const url = overdueReturn(customer, reservation)
    expect(decodeURIComponent(url.split('text=')[1])).toContain('#42')
    expect(decodeURIComponent(url.split('text=')[1])).toContain('immédiatement')
  })

  it('paymentIssue references reservation id', () => {
    const url = paymentIssue(customer, reservation)
    expect(decodeURIComponent(url.split('text=')[1])).toContain('paiement')
    expect(decodeURIComponent(url.split('text=')[1])).toContain('#42')
  })
})

describe('customer → business templates', () => {
  it('customerInquiry uses business number from env', () => {
    const url = customerInquiry()
    expect(url).toContain('wa.me/212600000000?text=')
    expect(decodeURIComponent(url.split('text=')[1])).toContain('réservation')
  })

  it('customerSupport includes reservation id', () => {
    const url = customerSupport(99)
    expect(url).toContain('wa.me/212600000000?text=')
    expect(decodeURIComponent(url.split('text=')[1])).toContain('#99')
  })
})
