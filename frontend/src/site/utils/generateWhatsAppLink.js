const WHATSAPP_NUMBER = '+212661234567'

export const generateWhatsAppLink = (message = '') => {
  const defaultMessage = 'Bonjour WAK Cars, je souhaite louer une voiture.'
  const finalMessage = message || defaultMessage
  const encodedMessage = encodeURIComponent(finalMessage)
  
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodedMessage}`
}

export const generateBookingWhatsAppLink = (booking) => {
  const { carName, pickupDate, dropoffDate, pickupLocation, totalAmount, reference } = booking
  
  const message = `Bonjour WAK Cars,

Je souhaite confirmer ma réservation :
📋 Référence : ${reference}
🚗 Véhicule : ${carName}
📅 Du ${pickupDate} au ${dropoffDate}
📍 Point de collecte : ${pickupLocation}
💰 Total : ${totalAmount} MAD

Merci de confirmer la disponibilité.`

  return generateWhatsAppLink(message)
}

export default generateWhatsAppLink
