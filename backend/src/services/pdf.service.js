const PDFDocument = require('pdfkit');

const generateReservationPDF = (reservation) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const { car, customer, pickup_location, dropoff_location } = reservation;
    const totalAmount = Number(reservation.total_amount).toFixed(2);

    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('WAK CARS', { align: 'center' })
      .fontSize(12)
      .font('Helvetica')
      .text('Location de voiture à Marrakech', { align: 'center' })
      .text('contact@wakcars.ma | +212 524 123 456', { align: 'center' })
      .moveDown(1.5);

    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(`Confirmation de réservation #${reservation.id}`, { align: 'center' })
      .moveDown(1);

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('CLIENT', { underline: true })
      .font('Helvetica')
      .text(`Nom : ${customer?.first_name || ''} ${customer?.last_name || ''}`)
      .text(`Téléphone : ${customer?.phone || '—'}`)
      .text(`Email : ${customer?.email || '—'}`)
      .moveDown(1);

    doc
      .font('Helvetica-Bold')
      .text('VÉHICULE', { underline: true })
      .font('Helvetica')
      .text(`${car?.brand || ''} ${car?.model || ''} (${car?.year || ''})`)
      .text(`Immatriculation : ${car?.license_plate || '—'}`)
      .text(`Carburant : ${car?.fuel_type || '—'} | Transmission : ${car?.transmission || '—'}`)
      .moveDown(1);

    doc
      .font('Helvetica-Bold')
      .text('DÉTAILS DE LA LOCATION', { underline: true })
      .font('Helvetica')
      .text(`Prise en charge : ${new Date(reservation.pickup_date).toLocaleString('fr-FR')}`)
      .text(`Lieu de prise en charge : ${pickup_location?.name_fr || '—'}`)
      .text(`Retour prévu : ${new Date(reservation.dropoff_date).toLocaleString('fr-FR')}`)
      .text(`Lieu de retour : ${dropoff_location?.name_fr || '—'}`)
      .moveDown(1);

    doc
      .font('Helvetica-Bold')
      .text('PAIEMENT', { underline: true })
      .font('Helvetica')
      .text(`GPS : ${reservation.has_gps ? 'Oui' : 'Non'}`)
      .text(`Siège enfant : ${reservation.has_child_seat ? 'Oui' : 'Non'}`)
      .text(`Statut paiement : ${reservation.payment_status}`)
      .moveDown(0.5)
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(`MONTANT TOTAL : ${totalAmount} MAD`)
      .moveDown(2);

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#666')
      .text(
        'Ce document vaut confirmation de réservation. Pour toute question, contactez-nous via WhatsApp.',
        { align: 'center' }
      );

    doc.end();
  });

const generateInvoicePDF = (reservation, payments) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const { car, customer } = reservation;
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('WAK CARS — FACTURE', { align: 'center' })
      .fontSize(11)
      .font('Helvetica')
      .text(`Facture N° ${reservation.id} — ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' })
      .moveDown(2);

    doc
      .font('Helvetica-Bold')
      .text('CLIENT')
      .font('Helvetica')
      .text(`${customer?.first_name || ''} ${customer?.last_name || ''}`)
      .text(`Tél : ${customer?.phone || '—'}`)
      .moveDown(1);

    doc
      .font('Helvetica-Bold')
      .text('VÉHICULE LOUÉ')
      .font('Helvetica')
      .text(`${car?.brand || ''} ${car?.model || ''} (${car?.year || ''}) — ${car?.license_plate || ''}`)
      .text(`Du : ${new Date(reservation.pickup_date).toLocaleDateString('fr-FR')}`)
      .text(`Au : ${new Date(reservation.dropoff_date).toLocaleDateString('fr-FR')}`)
      .moveDown(1);

    doc.font('Helvetica-Bold').text('PAIEMENTS REÇUS').font('Helvetica');
    payments.forEach((p) => {
      doc.text(
        `${new Date(p.created_at).toLocaleDateString('fr-FR')} — ${p.method} — ${Number(p.amount).toFixed(2)} MAD${p.reference ? ` (Réf: ${p.reference})` : ''}`
      );
    });

    doc
      .moveDown(1)
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(`TOTAL PAYÉ : ${totalPaid.toFixed(2)} MAD`)
      .text(`MONTANT DÛ : ${Number(reservation.total_amount).toFixed(2)} MAD`)
      .moveDown(2)
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#666')
      .text('Merci de votre confiance. Wak Cars — contact@wakcars.ma', { align: 'center' });

    doc.end();
  });

const generateReportPDF = (title, rows, columns) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(`WAK CARS — ${title}`, { align: 'center' })
      .fontSize(10)
      .font('Helvetica')
      .text(`Généré le ${new Date().toLocaleString('fr-FR')}`, { align: 'center' })
      .moveDown(1.5);

    const colWidth = Math.floor((doc.page.width - 100) / columns.length);
    let x = 50;
    let y = doc.y;

    doc.font('Helvetica-Bold').fontSize(9);
    columns.forEach((col) => {
      doc.text(col, x, y, { width: colWidth, align: 'left' });
      x += colWidth;
    });

    doc.moveDown(0.5).font('Helvetica').fontSize(8);
    rows.forEach((row) => {
      if (doc.y > doc.page.height - 80) doc.addPage({ layout: 'landscape' });
      x = 50;
      y = doc.y;
      columns.forEach((col, i) => {
        const val = row[i] !== undefined ? String(row[i]) : '—';
        doc.text(val, x, y, { width: colWidth, align: 'left' });
        x += colWidth;
      });
      doc.moveDown(0.3);
    });

    doc.end();
  });

module.exports = { generateReservationPDF, generateInvoicePDF, generateReportPDF };
