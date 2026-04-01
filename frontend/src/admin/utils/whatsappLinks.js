/**
 * wa.me link builders — keep message text aligned with `backend/src/services/whatsapp.service.js`.
 */

const businessPhone = () =>
  import.meta.env.VITE_WHATSAPP_BUSINESS_PHONE || '+212661234567'

export function normalizePhoneForWa(phone) {
  let d = String(phone).replace(/\D/g, '')
  if (d.startsWith('0')) d = `212${d.slice(1)}`
  return d
}

export function buildLink(phone, message) {
  const cleaned = normalizePhoneForWa(phone)
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${cleaned}?text=${encoded}`
}

export function pickupReminder(customer, reservation) {
  const date = new Date(reservation.pickup_date).toLocaleString('fr-FR')
  const msg = `Bonjour ${customer.first_name}, votre prise en charge de véhicule est demain à ${date}. Réservation #${reservation.id}. — Wak Cars`
  return buildLink(customer.phone, msg)
}

export function returnReminder(customer, reservation) {
  const date = new Date(reservation.dropoff_date).toLocaleString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const msg = `Bonjour ${customer.first_name}, rappel : retour du véhicule aujourd'hui avant ${date}. Réservation #${reservation.id}. — Wak Cars`
  return buildLink(customer.phone, msg)
}

export function overdueReturn(customer, reservation) {
  const msg = `Bonjour ${customer.first_name}, votre location (réservation #${reservation.id}) était due. Veuillez nous contacter immédiatement. — Wak Cars`
  return buildLink(customer.phone, msg)
}

export function paymentIssue(customer, reservation) {
  const msg = `Bonjour ${customer.first_name}, nous avons un problème avec le paiement de la réservation #${reservation.id}. Veuillez nous contacter. — Wak Cars`
  return buildLink(customer.phone, msg)
}

export function customerInquiry() {
  const msg = `Bonjour, je voudrais avoir des informations sur vos voitures disponibles / faire une réservation.`
  return buildLink(businessPhone(), msg)
}

export function customerSupport(reservationId) {
  const msg = `Bonjour, j'ai besoin d'aide concernant ma réservation #${reservationId}.`
  return buildLink(businessPhone(), msg)
}
