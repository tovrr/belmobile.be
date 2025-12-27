import { Quote, Reservation } from '../types';

export const getQuoteStatusEmail = (quote: Quote, id: string, lang: 'en' | 'fr' | 'nl') => {
    const trackingUrl = `https://belmobile.be/${lang}/track-order?id=${id}&email=${encodeURIComponent(quote.customerEmail)}`;

    const subjects: Record<string, string> = {
        en: `Update on your order #${id.substring(0, 6).toUpperCase()}`,
        fr: `Mise à jour de votre commande #${id.substring(0, 6).toUpperCase()}`,
        nl: `Update over uw bestelling #${id.substring(0, 6).toUpperCase()}`
    };

    const statusMessages: Record<string, Record<string, string>> = {
        en: {
            new: 'We have received your request and will process it shortly.',
            waiting_parts: 'We are currently waiting for parts to complete your repair.',
            in_repair: 'Your device is currently being repaired by our experts.',
            repaired: 'Great news! Your device has been successfully repaired.',
            ready: 'Your device is ready for pickup! Please visit our shop during opening hours.',
            shipped: 'Your order has been shipped. Track it using the link below.',
            processing: 'We are processing your order.',
            responded: 'We have responded to your request.',
            payment_sent: 'Good news! We have sent the payment for your device. It should arrive in your bank account shortly.',
            closed: 'Your order is now closed. Thank you for choosing Belmobile!'
        },
        fr: {
            new: 'Nous avons bien reçu votre demande et la traiterons sous peu.',
            waiting_parts: 'Nous attendons actuellement des pièces pour terminer votre réparation.',
            in_repair: 'Votre appareil est en cours de réparation par nos experts.',
            repaired: 'Bonne nouvelle ! Votre appareil a été réparé avec succès.',
            ready: 'Votre appareil est prêt ! Passez le récupérer en magasin durant les heures d\'ouverture.',
            shipped: 'Votre commande a été expédiée. Suivez-la via le lien ci-dessous.',
            processing: 'Nous traitons votre commande.',
            responded: 'Nous avons répondu à votre demande.',
            payment_sent: 'Bonne nouvelle ! Nous avons envoyé le paiement pour votre appareil. Il devrait arriver sur votre compte bancaire sous peu.',
            closed: 'Votre commande est maintenant clôturée. Merci d\'avoir choisi Belmobile !'
        },
        nl: {
            new: 'We hebben uw aanvraag ontvangen en zullen deze spoedig behandelen.',
            waiting_parts: 'We wachten momenteel op onderdelen om uw reparatie te voltooien.',
            in_repair: 'Uw apparaat wordt momenteel hersteld door onze experts.',
            repaired: 'Goed nieuws! Uw apparaat is succesvol gerepareerd.',
            ready: 'Uw apparaat ligt klaar! Kom langs in de winkel tijdens de openingsuren.',
            shipped: 'Uw bestelling is verzonden. Volg het via de onderstaande link.',
            processing: 'We verwerken uw bestelling.',
            responded: 'We hebben gereageerd op uw aanvraag.',
            payment_sent: 'Goed nieuws! We hebben de betaling voor uw apparaat verzonden. Het zou binnenkort op uw bankrekening moeten staan.',
            closed: 'Uw bestelling is nu afgerond. Bedankt dat u voor Belmobile hebt gekozen!'
        }
    };

    const message = statusMessages[lang]?.[quote.status] || statusMessages['en'][quote.status] || `Status updated to: ${quote.status}`;
    const subject = subjects[lang] || subjects['en'];
    const trackButton = lang === 'fr' ? 'Suivre la commande' : lang === 'nl' ? 'Volg bestelling' : 'Track Order';

    const html = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #4338ca; padding: 30px; text-align: center;">
                <div style="color: #ffffff; font-size: 24px; font-weight: bold;">BELMOBILE.BE</div>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #4338ca;">${lang === 'fr' ? 'Mise à jour de la commande' : lang === 'nl' ? 'Bestellingsupdate' : 'Order Update'}</h2>
                <p>${message}</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${trackingUrl}" style="background-color: #4338ca; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">${trackButton}</a>
                </div>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">Order ID: ${id}</p>
            </div>
        </div>
    `;

    return { subject, html };
};

export const getReservationStatusEmail = (reservation: Reservation, id: string, lang: 'en' | 'fr' | 'nl', paymentLink?: string) => {
    const isShipping = reservation.deliveryMethod === 'shipping' && reservation.status !== 'ready';
    const trackingUrl = `https://belmobile.be/${lang}/track-order?id=${id}&email=${encodeURIComponent(reservation.customerEmail)}`;
    const finalPaymentLink = paymentLink || reservation.paymentLink || `https://buy.stripe.com/test_payment_link_placeholder?prefilled_email=${encodeURIComponent(reservation.customerEmail)}`;

    const subjects: Record<string, string> = {
        en: isShipping ? "Action Required: Payment for your Order" : "Your Reservation is Ready!",
        fr: isShipping ? "Action Requise : Paiement de votre commande" : "Votre réservation est prête !",
        nl: isShipping ? "Actie vereist: Betaling voor uw bestelling" : "Uw reservering ligt klaar!"
    };

    const trackButtons: Record<string, string> = {
        en: "Track Order",
        fr: "Suivre la commande",
        nl: "Volg bestelling"
    };

    const subject = subjects[lang] || subjects['en'];

    const html = isShipping
        ? `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #4338ca; padding: 30px; text-align: center;">
                <div style="color: #ffffff; font-size: 24px; font-weight: bold;">BELMOBILE.BE</div>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #4338ca;">${lang === 'fr' ? 'Bonne nouvelle ! Votre commande est confirmée.' : lang === 'nl' ? 'Goed nieuws! Uw bestelling is bevestigd.' : 'Good news! Your order is confirmed.'}</h2>
                <p>${lang === 'fr' ? `Nous avons vérifié votre commande pour <strong>${reservation.productName}</strong>.` : lang === 'nl' ? `We hebben uw bestelling voor <strong>${reservation.productName}</strong> geverifieerd.` : `We have verified your order for <strong>${reservation.productName}</strong>.`}</p>
                <p>${lang === 'fr' ? `Pour finaliser l'expédition à <strong>${reservation.shippingCity}</strong>, veuillez effectuer le paiement via le lien sécurisé ci-dessous :` : lang === 'nl' ? `Om de verzending naar <strong>${reservation.shippingCity}</strong> te voltooien, dient u de betaling uit te voeren via de onderstaande beveiligde link:` : `To finalize the shipment to <strong>${reservation.shippingCity}</strong>, please complete the payment using the secure link below:`}</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${finalPaymentLink}" style="background-color: #4338ca; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">${lang === 'fr' ? 'Payer en toute sécurité' : lang === 'nl' ? 'Nu veilig betalen' : 'Pay Now Securely'}</a>
                </div>
                <div style="text-align: center; margin-bottom: 20px;">
                    <a href="${trackingUrl}" style="color: #4338ca; font-weight: bold; text-decoration: underline;">${trackButtons[lang]}</a>
                </div>
                <p style="color: #666; font-size: 11px;">${lang === 'fr' ? 'Le lien ne fonctionne pas ? Copiez ceci :' : lang === 'nl' ? 'Link werkt niet? Plak dit :' : 'Link not working? Paste this :'} ${finalPaymentLink}</p>
            </div>
           </div>`
        : `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #4338ca; padding: 30px; text-align: center;">
                <div style="color: #ffffff; font-size: 24px; font-weight: bold;">BELMOBILE.BE</div>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #4338ca;">${lang === 'fr' ? 'Votre appareil est prêt !' : lang === 'nl' ? 'Uw apparaat ligt klaar!' : 'Your device is ready!'}</h2>
                <p>${lang === 'fr' ? `Votre réservation pour <strong>${reservation.productName}</strong> a été approuvée.` : lang === 'nl' ? `Uw reservering voor <strong>${reservation.productName}</strong> is goedgekeurd.` : `Your reservation for <strong>${reservation.productName}</strong> has been approved.`}</p>
                <p>${lang === 'fr' ? 'Vous pouvez venir le récupérer en magasin quand vous le souhaitez.' : lang === 'nl' ? 'U kunt het in de winkel komen ophalen wanneer u maar wilt.' : 'You can come to pick it up at the shop whenever you are ready.'}</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${trackingUrl}" style="background-color: #4338ca; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">${trackButtons[lang]}</a>
                </div>
            </div>
           </div>`;

    return { subject, html };
};
