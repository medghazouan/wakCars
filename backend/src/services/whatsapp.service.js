const env = require('../config/env');

const buildLink = (phone, message) => {
  const cleaned = phone.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encoded}`;
};

const pickupReminder = (customer, reservation) => {
  const date = new Date(reservation.pickup_date).toLocaleString('fr-FR');
  const msg = `Bonjour ${customer.first_name}, votre prise en charge de véhicule est demain à ${date}. Réservation #${reservation.id}. — Wak Cars`;
  return buildLink(customer.phone, msg);
};

const returnReminder = (customer, reservation) => {
  const date = new Date(reservation.dropoff_date).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const msg = `Bonjour ${customer.first_name}, rappel : retour du véhicule aujourd'hui avant ${date}. Réservation #${reservation.id}. — Wak Cars`;
  return buildLink(customer.phone, msg);
};

const overdueReturn = (customer, reservation) => {
  const msg = `Bonjour ${customer.first_name}, votre location (réservation #${reservation.id}) était due. Veuillez nous contacter immédiatement. — Wak Cars`;
  return buildLink(customer.phone, msg);
};

const paymentIssue = (customer, reservation) => {
  const msg = `Bonjour ${customer.first_name}, nous avons un problème avec le paiement de la réservation #${reservation.id}. Veuillez nous contacter. — Wak Cars`;
  return buildLink(customer.phone, msg);
};

const customerInquiry = () => {
  const msg = `Bonjour, je voudrais avoir des informations sur vos voitures disponibles / faire une réservation.`;
  return buildLink(env.WHATSAPP_BUSINESS_PHONE, msg);
};

const customerSupport = (reservationId) => {
  const msg = `Bonjour, j'ai besoin d'aide concernant ma réservation #${reservationId}.`;
  return buildLink(env.WHATSAPP_BUSINESS_PHONE, msg);
};

module.exports = {
  pickupReminder,
  returnReminder,
  overdueReturn,
  paymentIssue,
  customerInquiry,
  customerSupport,
};
