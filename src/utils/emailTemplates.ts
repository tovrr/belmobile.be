import { Quote, Reservation } from '../types';

export const getQuoteStatusEmail = (quote: Quote, id: string, lang: 'en' | 'fr' | 'nl') => {
    const trackingUrl = `https://belmobile.be/${lang}/track-order?id=${id}&email=${encodeURIComponent(quote.customerEmail)}`;

    const subjects: Record<string, string> = {
        en: `📦 Update on your order #${id.substring(0, 6).toUpperCase()} - Belmobile`,
        fr: `📦 Mise à jour de votre commande #${id.substring(0, 6).toUpperCase()} - Belmobile`,
        nl: `📦 Update over uw bestelling #${id.substring(0, 6).toUpperCase()} - Belmobile`
    };

    const statusMessages: Record<string, Record<string, string>> = {
        en: {
            new: '👋 We have received your request and will process it shortly. Thanks for choosing us!',
            waiting_parts: '⏳ Needs a little patience! We are currently waiting for specific parts to complete your repair perfectly.',
            in_repair: '🛠️ Work in progress! Your device is currently in the hands of our experts.',
            repaired: '✅ Great news! Your device has been successfully repaired and is working like new.',
            ready: '🎉 Your device is ready! Please visit our shop during opening hours to pick it up.',
            shipped: '🚚 On its way! Your order has been shipped. Track it using the link below.',
            processing: '⚙️ We are processing your order with care.',
            responded: '📬 We have responded to your request. Please check your tracking page.',
            payment_sent: '💸 Money sent! We have transferred the payment for your device. It should arrive shortly.',
            closed: '📂 Your order is now closed. Thank you for trusting Belmobile!'
        },
        fr: {
            new: '👋 Nous avons bien reçu votre demande et la traiterons sous peu. Merci de votre confiance !',
            waiting_parts: '⏳ Un peu de patience ! Nous attendons actuellement des pièces spécifiques pour une réparation parfaite.',
            in_repair: '🛠️ Au travail ! Votre appareil est actuellement entre les mains de nos experts.',
            repaired: '✅ Bonne nouvelle ! Votre appareil a été réparé avec succès et fonctionne comme neuf.',
            ready: '🎉 Votre appareil est prêt ! Passez le récupérer en magasin durant les heures d\'ouverture.',
            shipped: '🚚 En route ! Votre commande a été expédiée. Suivez-la via le lien ci-dessous.',
            processing: '⚙️ Nous traitons votre commande avec soin.',
            responded: '📬 Nous avons répondu à votre demande. Vérifiez votre page de suivi.',
            payment_sent: '💸 Paiement envoyé ! Nous avons effectué le virement pour votre appareil. Il devrait arriver sous peu.',
            closed: '📂 Votre commande est maintenant clôturée. Merci d\'avoir choisi Belmobile !'
        },
        nl: {
            new: '👋 We hebben uw aanvraag ontvangen en zullen deze spoedig behandelen. Bedankt voor uw vertrouwen!',
            waiting_parts: '⏳ Even geduld! We wachten momenteel op specifieke onderdelen om uw reparatie perfect uit te voeren.',
            in_repair: '🛠️ Aan het werk! Uw apparaat is momenteel in handen van onze experts.',
            repaired: '✅ Goed nieuws! Uw apparaat is succesvol gerepareerd en werkt weer als nieuw.',
            ready: '🎉 Uw apparaat ligt klaar! Kom langs in de winkel tijdens de openingsuren.',
            shipped: '🚚 Onderweg! Uw bestelling is verzonden. Volg het via de onderstaande link.',
            processing: '⚙️ We verwerken uw bestelling met zorg.',
            responded: '📬 We hebben gereageerd op uw aanvraag. Controleer uw volgpagina.',
            payment_sent: '💸 Betaling verzonden! We hebben de betaling voor uw apparaat uitgevoerd. Het komt er snel aan.',
            closed: '📂 Uw bestelling is nu afgerond. Bedankt dat u voor Belmobile hebt gekozen!'
        }
    };

    const message = statusMessages[lang]?.[quote.status] || statusMessages['en'][quote.status] || `Status updated to: ${quote.status}`;
    const subject = subjects[lang] || subjects['en'];
    const trackButton = lang === 'fr' ? 'Suivre ma commande' : lang === 'nl' ? 'Volg mijn bestelling' : 'Track My Order';

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%); padding: 32px; text-align: center;">
                <div style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">BELMOBILE.BE</div>
                <div style="color: #a5b4fc; font-size: 14px; margin-top: 4px;">Expert Repair & Buyback</div>
            </div>
            <div style="padding: 40px 32px; background-color: #ffffff;">
                <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">${lang === 'fr' ? 'Mise à jour de votre commande' : lang === 'nl' ? 'Update van uw bestelling' : 'Order Status Update'}</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin: 24px 0;">${message}</p>
                
                <div style="text-align: center; margin: 36px 0;">
                    <a href="${trackingUrl}" style="background-color: #4338ca; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(67, 56, 202, 0.3); transition: transform 0.2s;">
                        ${trackButton}
                    </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                
                <div style="text-align: center; color: #94a3b8; font-size: 13px;">
                    <p style="margin: 4px 0;">Order Reference: <strong>${id}</strong></p>
                    <p style="margin: 4px 0;">Product: <strong>${formatDeviceName(quote.brand)} ${formatDeviceName(quote.model)}</strong></p>
                </div>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                &copy; ${new Date().getFullYear()} Belmobile. All rights reserved.
            </div>
        </div>
    `;

    return { subject, html };
};

export const getPaymentReceivedEmail = (reservation: Reservation, lang: 'en' | 'fr' | 'nl') => {
    const trackingUrl = `https://belmobile.be/${lang}/track-order?id=${reservation.id}&email=${encodeURIComponent(reservation.customerEmail)}`;

    const subjects: Record<string, string> = {
        en: "✅ Payment Received - Your Order is Confirmed!",
        fr: "✅ Paiement Reçu - Votre commande est confirmée !",
        nl: "✅ Betaling Ontvangen - Uw bestelling is bevestigd!"
    };

    const content: Record<string, { title: string, body: string, status: string }> = {
        en: {
            title: "Payment Received!",
            body: `Great news! We have successfully received your payment for <strong>${reservation.productName}</strong>.`,
            status: "We will now proceed with your order immediately. You will receive another update as soon as it's shipped or ready."
        },
        fr: {
            title: "Paiement Reçu !",
            body: `Excellente nouvelle ! Nous avons bien reçu votre paiement pour <strong>${reservation.productName}</strong>.`,
            status: "Nous allons maintenant traiter votre commande immédiatement. Vous recevrez une nouvelle mise à jour dès qu'elle sera expédiée ou prête."
        },
        nl: {
            title: "Betaling Ontvangen!",
            body: `Goed nieuws! We hebben uw betaling voor <strong>${reservation.productName}</strong> succesvol ontvangen.`,
            status: "We gaan nu direct aan de slag met uw bestelling. U ontvangt een nieuwe update zodra deze verzonden is of klaarstaat."
        }
    };

    const t = content[lang] || content['en'];
    const trackButton = lang === 'fr' ? 'Suivre ma commande' : lang === 'nl' ? 'Volg mijn bestelling' : 'Track My Order';

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px; text-align: center;">
                <div style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">BELMOBILE.BE</div>
                <div style="color: #a7f3d0; font-size: 14px; margin-top: 4px;">Order Confirmed</div>
            </div>
            <div style="padding: 40px 32px; background-color: #ffffff;">
                <h2 style="color: #047857; margin-top: 0; font-size: 24px; text-align: center;">${t.title}</h2>
                <div style="background-color: #ecfdf5; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                     <div style="font-size: 48px; line-height: 1;">✅</div>
                </div>
                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin: 0 0 16px 0;">${t.body}</p>
                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin: 0;">${t.status}</p>
                
                <div style="text-align: center; margin: 36px 0;">
                    <a href="${trackingUrl}" style="background-color: #059669; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.3); transition: transform 0.2s;">
                        ${trackButton}
                    </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                
                <div style="text-align: center; color: #94a3b8; font-size: 13px;">
                    <p style="margin: 4px 0;">Order Reference: <strong>${reservation.id}</strong></p>
                </div>
            </div>
        </div>
    `;

    return { subject: subjects[lang] || subjects['en'], html };
};

export const getReservationStatusEmail = (reservation: Reservation, id: string, lang: 'en' | 'fr' | 'nl', paymentLink?: string) => {
    const isShipping = reservation.deliveryMethod === 'shipping' && reservation.status !== 'ready';
    const trackingUrl = `https://belmobile.be/${lang}/track-order?id=${id}&email=${encodeURIComponent(reservation.customerEmail)}`;
    const finalPaymentLink = paymentLink || reservation.paymentLink || '#';

    const subjects: Record<string, string> = {
        en: isShipping ? "🚨 Action Required: Payment for your Order - Belmobile" : "🎉 Your Belmobile Quote is Ready!", // Note: Assuming reservation logic implies 'Ready' means ready for pickup/next step
        fr: isShipping ? "🚨 Action Requise : Paiement de votre commande - Belmobile" : "🎉 Votre réservation Belmobile est prête !",
        nl: isShipping ? "🚨 Actie vereist: Betaling voor uw bestelling - Belmobile" : "🎉 Uw Belmobile reservering ligt klaar!"
    };

    const trackButton = lang === 'fr' ? 'Suivre ma commande' : lang === 'nl' ? 'Volg mijn bestelling' : 'Track My Order';
    const subject = subjects[lang] || subjects['en'];

    const content = isShipping ? {
        en: {
            title: "Good news! Order Confirmed.",
            body: `We have verified your order for <strong>${reservation.productName}</strong>. To finalize shipping to <strong>${reservation.shippingCity}</strong>, please complete payment securely below.`,
            cta: "Pay Now Securely"
        },
        fr: {
            title: "Bonne nouvelle ! Commande confirmée.",
            body: `Nous avons vérifié votre commande pour <strong>${reservation.productName}</strong>. Pour finaliser l'expédition vers <strong>${reservation.shippingCity}</strong>, veuillez régler via le lien sécurisé ci-dessous.`,
            cta: "Payer en toute sécurité"
        },
        nl: {
            title: "Goed nieuws! Bestelling bevestigd.",
            body: `We hebben uw bestelling voor <strong>${reservation.productName}</strong> geverifieerd. Om de verzending naar <strong>${reservation.shippingCity}</strong> te voltooien, betaal veilig via onderstaande link.`,
            cta: "Nu veilig betalen"
        }
    } : {
        en: {
            title: "Your device is ready!",
            body: `Your reservation for <strong>${reservation.productName}</strong> has been approved. You can pick it up at our shop whenever you're ready!`,
            cta: "Track My Order"
        },
        fr: {
            title: "Votre appareil est prêt !",
            body: `Votre réservation pour <strong>${reservation.productName}</strong> a été approuvée. Vous pouvez passer la récupérer en magasin quand vous le souhaitez !`,
            cta: "Suivre ma commande"
        },
        nl: {
            title: "Uw apparaat ligt klaar!",
            body: `Uw reservering voor <strong>${reservation.productName}</strong> is goedgekeurd. U kunt deze ophalen in de winkel wanneer u wilt!`,
            cta: "Volg mijn bestelling"
        }
    };

    // Select correct lang content
    const t = (isShipping ? (content as any)[lang] : (content as any)[lang]) || (isShipping ? (content as any)['en'] : (content as any)['en']);

    const html = `
       <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%); padding: 32px; text-align: center;">
                <div style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">BELMOBILE.BE</div>
                <div style="color: #a5b4fc; font-size: 14px; margin-top: 4px;">Status Update</div>
            </div>
            <div style="padding: 40px 32px; background-color: #ffffff;">
                <h2 style="color: #4338ca; margin-top: 0; font-size: 24px; text-align: center;">${t.title}</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin: 24px 0;">${t.body}</p>
                
                <div style="text-align: center; margin: 36px 0;">
                    ${isShipping ?
            `<a href="${finalPaymentLink}" style="background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3); transition: transform 0.2s;">${t.cta}</a>`
            :
            `<a href="${trackingUrl}" style="background-color: #4338ca; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(67, 56, 202, 0.3); transition: transform 0.2s;">${t.cta}</a>`
        }
                </div>
                
                ${isShipping ? `<div style="text-align: center; margin-bottom: 20px;"><a href="${trackingUrl}" style="color: #4338ca; font-weight: bold; text-decoration: underline;">${trackButton}</a></div>` : ''}
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                
                <div style="text-align: center; color: #94a3b8; font-size: 13px;">
                    <p style="margin: 4px 0;">Order Reference: <strong>${id}</strong></p>
                </div>
            </div>
       </div>
    `;

    return { subject, html };
};

export const generateReviewEmailHtml = (lang: string, name: string, shopId: string, orderId: string, shopName: string) => {
    const reviewUrl = `https://belmobile.be/${lang}/review?id=${orderId}&shop=${shopId}`;

    const subjects: Record<string, string> = {
        en: `⭐ How was your experience at ${shopName}?`,
        fr: `⭐ Comment s'est passée votre visite chez ${shopName} ?`,
        nl: `⭐ Hoe was uw ervaring bij ${shopName}?`
    };

    const subject = subjects[lang] || subjects['en'];

    const content: Record<string, { title: string, greeting: string, body: string, cta: string }> = {
        en: {
            title: "We value your feedback",
            greeting: `Hi ${name},`,
            body: `Thank you for choosing Belmobile ${shopName}. We would love to hear what you thought of our services. It only takes a minute!`,
            cta: "Leave a Review"
        },
        fr: {
            title: "Votre avis nous intéresse",
            greeting: `Bonjour ${name},`,
            body: `Merci d'avoir choisi Belmobile ${shopName}. Nous aimerions savoir ce que vous avez pensé de nos services. Cela ne prend qu'une minute !`,
            cta: "Laisser un avis"
        },
        nl: {
            title: "Uw mening telt",
            greeting: `Beste ${name},`,
            body: `Bedankt voor uw bezoek aan Belmobile ${shopName}. We horen graag wat u van onze diensten vond. Het duurt maar een minuutje!`,
            cta: "Beoordeling achterlaten"
        }
    };

    const t = content[lang] || content['en'];

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); padding: 32px; text-align: center;">
                <div style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">BELMOBILE.BE</div>
                <div style="color: #fffbeb; font-size: 14px; margin-top: 4px;">Service Feedback</div>
            </div>
            <div style="padding: 40px 32px; background-color: #ffffff;">
                <h2 style="color: #d97706; margin-top: 0; font-size: 24px; text-align: center;">${t.title}</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin: 24px 0;">${t.greeting}</p>
                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin: 24px 0;">${t.body}</p>
                
                <div style="text-align: center; margin: 36px 0;">
                    <a href="${reviewUrl}" style="background-color: #d97706; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(217, 119, 6, 0.3); transition: transform 0.2s;">
                        ${t.cta}
                    </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                
                <div style="text-align: center; color: #94a3b8; font-size: 13px;">
                    <p style="margin: 4px 0;">Order Reference: <strong>${orderId}</strong></p>
                </div>
            </div>
        </div>
    `;

    return { subject, htmlContent: html };
};

const formatDeviceName = (name: string) => name ? name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
