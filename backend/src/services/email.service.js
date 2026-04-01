const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');
const pdfService = require('./pdf.service');

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const extFromUrl = (url) => {
  const m = String(url).match(/\.(jpe?g|png|webp)$/i);
  return m ? m[0].toLowerCase() : '.jpg';
};

const transporter = nodemailer.createTransport({
  host: env.RESEND_SMTP_HOST,
  port: env.RESEND_SMTP_PORT,
  secure: env.RESEND_SMTP_PORT === 465,
  auth: {
    user: env.RESEND_SMTP_USER,
    pass: env.RESEND_API_KEY,
  },
});

const from = `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`;

const mailConfigured = () => Boolean(env.RESEND_API_KEY);

const send = async ({ to, subject, html, attachments = [] }) => {
  try {
    const info = await transporter.sendMail({ from, to, subject, html, attachments });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Email failed to ${to}: ${err.message}`);
    throw err;
  }
};

const sendReservationConfirmation = async (reservation) => {
  const { customer, car, pickup_location, dropoff_location } = reservation;
  const customerEmail = customer?.email;
  if (!customerEmail) {
    logger.warn(`[email] No customer email — skip confirmation for reservation #${reservation.id}`);
    return null;
  }
  if (!mailConfigured()) {
    logger.warn('[email] RESEND_API_KEY is not set — cannot send confirmation email. Set it in backend/.env');
    return null;
  }

  let attachments = [];
  try {
    const pdfBuffer = await pdfService.generateReservationPDF(reservation);
    attachments = [
      {
        filename: `confirmation-${reservation.id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ];
  } catch (err) {
    logger.error(`Reservation PDF failed for #${reservation.id}: ${err.message}`);
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">Confirmation de réservation — Wak Cars</h2>
      <p>Bonjour <strong>${customer.first_name} ${customer.last_name}</strong>,</p>
      <p>Votre réservation a été confirmée. Voici le récapitulatif :</p>
      <table style="width:100%; border-collapse: collapse;">
        <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Véhicule</strong></td><td style="padding:8px; border:1px solid #ddd;">${car.brand} ${car.model} (${car.year})</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Prise en charge</strong></td><td style="padding:8px; border:1px solid #ddd;">${new Date(reservation.pickup_date).toLocaleString('fr-FR')} — ${pickup_location.name_fr}</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Retour</strong></td><td style="padding:8px; border:1px solid #ddd;">${new Date(reservation.dropoff_date).toLocaleString('fr-FR')} — ${dropoff_location.name_fr}</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Montant total</strong></td><td style="padding:8px; border:1px solid #ddd;"><strong>${Number(reservation.total_amount).toFixed(2)} MAD</strong></td></tr>
      </table>
      <p>Pour toute question, contactez-nous via WhatsApp : <a href="https://wa.me/${env.WHATSAPP_BUSINESS_PHONE.replace('+', '')}">${env.WHATSAPP_BUSINESS_PHONE}</a></p>
      <p style="color: #666; font-size: 12px;">Wak Cars — Location de voiture à Marrakech</p>
    </div>`;

  return send({
    to: customerEmail,
    subject: `Confirmation de réservation #${reservation.id} — Wak Cars`,
    html,
    attachments,
  });
};

const sendInvoice = async (reservation, payments, pdfBuffer) => {
  const customerEmail = reservation.customer?.email;
  if (!customerEmail) {
    logger.warn(`[email] No customer email — skip invoice for reservation #${reservation.id}`);
    return null;
  }
  if (!mailConfigured()) {
    logger.warn('[email] RESEND_API_KEY is not set — cannot send invoice email. Set it in backend/.env');
    return null;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">Facture — Wak Cars</h2>
      <p>Bonjour <strong>${reservation.customer.first_name} ${reservation.customer.last_name}</strong>,</p>
      <p>Votre location est terminée. Veuillez trouver ci-joint votre facture pour la réservation <strong>#${reservation.id}</strong>.</p>
      <p>Merci de votre confiance !</p>
      <p style="color: #666; font-size: 12px;">Wak Cars — Location de voiture à Marrakech</p>
    </div>`;

  return send({
    to: customerEmail,
    subject: `Facture réservation #${reservation.id} — Wak Cars`,
    html,
    attachments: pdfBuffer
      ? [{ filename: `facture-${reservation.id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
      : [],
  });
};

const sendDamageNotification = async (damageReport, customer) => {
  if (!customer?.email) return;
  if (!mailConfigured()) {
    logger.warn('[email] RESEND_API_KEY is not set — cannot send damage notification.');
    return null;
  }

  const images = damageReport.images || [];
  const attachments = images.map((img, i) => ({
    filename: `dommage-${damageReport.id}-${i + 1}${extFromUrl(img.url)}`,
    path: img.url,
  }));

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #c0392b;">Rapport de dommages — Wak Cars</h2>
      <p>Bonjour <strong>${escapeHtml(customer.first_name)} ${escapeHtml(customer.last_name)}</strong>,</p>
      <p>Suite au retour du véhicule, nous avons constaté les dommages suivants :</p>
      <blockquote style="border-left: 4px solid #c0392b; padding-left: 16px; color: #333;">
        ${escapeHtml(damageReport.description)}
      </blockquote>
      ${damageReport.estimated_cost ? `<p><strong>Coût estimé :</strong> ${Number(damageReport.estimated_cost).toFixed(2)} MAD</p>` : ''}
      ${attachments.length ? `<p><strong>Photos :</strong> ${attachments.length} image(s) jointe(s) à cet e-mail.</p>` : ''}
      <p>Notre équipe vous contactera pour les démarches de règlement.</p>
      <p>Pour toute question : <a href="https://wa.me/${env.WHATSAPP_BUSINESS_PHONE.replace('+', '')}">${env.WHATSAPP_BUSINESS_PHONE}</a></p>
      <p style="color: #666; font-size: 12px;">Wak Cars — Location de voiture à Marrakech</p>
    </div>`;

  return send({
    to: customer.email,
    subject: `Rapport de dommages — Réservation #${damageReport.reservation_id || 'N/A'} — Wak Cars`,
    html,
    attachments,
  });
};

const sendContactForm = async ({ name, email, message }) => {
  if (!env.RESEND_API_KEY) {
    logger.info(`Contact form (email not configured): ${name} <${email}> — ${message.slice(0, 200)}`);
    return null;
  }
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <p><strong>Message du site Wak Cars</strong></p>
      <p>De : ${name} &lt;${email}&gt;</p>
      <hr />
      <p>${String(message).replace(/\n/g, '<br/>')}</p>
    </div>`;
  return send({
    to: env.EMAIL_FROM,
    replyTo: email,
    subject: `Contact site — ${name}`,
    html,
  });
};

module.exports = {
  send,
  sendReservationConfirmation,
  sendInvoice,
  sendDamageNotification,
  sendContactForm,
};
