import { Quote, Reservation } from '../types';

// Helper to format simplified slugs
const formatDeviceName = (name: string) => name ? name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

/**
 * AEGIS MASTER EMAIL LAYOUT
 * Professional, modern, and aligned with Belmobile Core visual identity.
 */
const LAYOUT = (content: string, lang: string, trackingUrl: string, trackButton: string, orderId: string, accentColor = '#4338ca') => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @media only screen and (max-width: 620px) {
            .container { width: 100% !important; border-radius: 0 !important; }
            .content { padding: 32px 24px !important; }
            .header { padding: 32px 20px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" class="container" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); width: 600px; max-width: 95%;">
                    <!-- Header -->
                    <tr>
                        <td align="center" class="header" style="padding: 48px 40px; background-color: #1e1b4b; background-image: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);">
                            <div style="font-size: 32px; font-weight: 900; color: #ffffff; letter-spacing: -1px; margin-bottom: 4px;">BELMOBILE<span style="color: ${accentColor}">.BE</span></div>
                            <div style="font-size: 12px; font-weight: 700; color: #a5b4fc; letter-spacing: 2px; text-transform: uppercase;">Repair & Buyback Center</div>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td class="content" style="padding: 48px 48px 40px 48px;">
                            ${content}
                            
                            <!-- Tracking Button -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 40px;">
                                <tr>
                                    <td align="center">
                                        <a href="${trackingUrl}" style="background-color: ${accentColor}; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 16px; font-weight: 800; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(67, 56, 202, 0.4);">
                                            ${trackButton}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Quote Details -->
                    <tr>
                        <td align="center" style="padding: 0 48px 40px 48px;">
                            <div style="height: 1px; background-color: #f1f5f9; width: 100%; margin-bottom: 24px;"></div>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                                        Order Reference: <strong style="color: #475569;">${orderId}</strong>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 32px; background-color: #f8fafc; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9;">
                            <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} Belmobile Official. All rights reserved.</p>
                            <p style="margin: 0;">Rue Gallait 4, 1030 Schaerbeek, Brussels</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const getQuoteStatusEmail = (quote: Quote, id: string, lang: 'en' | 'fr' | 'nl' | 'tr') => {
    const trackingUrl = `https://belmobile.be/${lang}/track-order?id=${id}&email=${encodeURIComponent(quote.customerEmail)}`;

    const subjects: Record<string, string> = {
        en: `📦 Update: Order #${id.substring(0, 8).toUpperCase()}`,
        fr: `📦 Suivi : Commande #${id.substring(0, 8).toUpperCase()}`,
        nl: `📦 Status : Bestelling #${id.substring(0, 8).toUpperCase()}`,
        tr: `📦 Güncelleme: Sipariş #${id.substring(0, 8).toUpperCase()}`
    };

    const titles: Record<string, string> = {
        en: 'Order Status Update',
        fr: 'Mise à jour de votre commande',
        nl: 'Status van uw bestelling',
        tr: 'Sipariş Durumu Güncellemesi'
    };

    const statusMessages: Record<string, Record<string, string>> = {
        en: {
            new: '👋 We have received your request and will process it shortly. Thanks for choosing us!',
            pending_drop: '📥 Your order is confirmed! Please drop off your device at the selected shop whenever you\'re ready.',
            in_diagnostic: '🔍 Our technicians have received your device and are currently performing a complete diagnostic.',
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
            pending_drop: '📥 Votre commande est confirmée ! Vous pouvez déposer votre appareil au magasin choisi quand vous le souhaitez.',
            in_diagnostic: '🔍 Nos techniciens ont bien reçu votre appareil et effectuent actuellement un diagnostic complet.',
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
            pending_drop: '📥 Uw bestelling is bevestigd! U kunt uw toestel afgeven in de gekozen winkel wanneer u maar wilt.',
            in_diagnostic: '🔍 Onze technici hebben uw toestel ontvangen en voeren momenteel een volledige diagnose uit.',
            waiting_parts: '⏳ Even geduld! We wachten momenteel op specifieke onderdelen om uw reparatie perfect uit te voeren.',
            in_repair: '🛠️ Aan het werk! Uw apparaat is momenteel in handen van onze experts.',
            repaired: '✅ Goed nieuws! Uw apparaat is succesvol gerepareerd en werkt weer als nieuw.',
            ready: '🎉 Uw apparaat ligt klaar! Kom langs in de winkel tijdens de openingsuren.',
            shipped: '🚚 Onderweg! Uw bestelling is verzonden. Volg het via de onderstaande link.',
            processing: '⚙️ We verwerken uw bestelling met zorg.',
            responded: '📬 We hebben gereageerd op uw aanvraag. Controleer uw volgpagina.',
            payment_sent: '💸 Betaling verzonden! We hebben de betaling voor uw apparaat uitgevoerd. Het komt er snel aan.',
            closed: '📂 Uw bestelling is nu afgerond. Bedankt dat u voor Belmobile hebt gekozen!'
        },
        tr: {
            new: '👋 Talebinizi aldık ve kısa süre içinde işleme koyacağız. Bizi seçtiğiniz için teşekkürler!',
            pending_drop: '📥 Siparişiniz onaylandı! Hazır olduğunuzda cihazınızı seçtiğiniz mağazaya bırakabilirsiniz.',
            in_diagnostic: '🔍 Teknisyenlerimiz cihazınızı teslim aldı ve şu anda tam bir arıza tespiti yapıyor.',
            waiting_parts: '⏳ Biraz sabır gerekiyor! Onarımınızı mükemmel bir şekilde tamamlamak için şu anda belirli parçaları bekliyoruz.',
            in_repair: '🛠️ İşlem devam ediyor! Cihazınız şu anda uzmanlarımızın ellerinde.',
            repaired: '✅ Harika haber! Cihazınız başarıyla onarıldı ve yeni gibi çalışıyor.',
            ready: '🎉 Cihazınız hazır! Teslim almak için lütfen çalışma saatleri içinde mağazamızı ziyaret edin.',
            shipped: '🚚 Yola çıktı! Siparişiniz kargoya verildi. Aşağıdaki bağlantıyı kullanarak takip edebilirsiniz.',
            processing: '⚙️ Siparişinizi özenle işliyoruz.',
            responded: '📬 Talebinize yanıt verdik. Lütfen takip sayfanızı kontrol edin.',
            payment_sent: '💸 Ödeme gönderildi! Cihazınızın ödemesini transfer ettik. Kısa süre içinde ulaşacaktır.',
            closed: '📂 Siparişiniz kapatıldı. Belmobile\'a güvendiğiniz için teşekkürler!'
        }
    };

    const message = statusMessages[lang]?.[quote.status] || statusMessages['en'][quote.status] || `Status updated to: ${quote.status}`;
    const trackButton = lang === 'fr' ? 'Suivre ma commande' : lang === 'nl' ? 'Volg mijn bestelling' : lang === 'tr' ? 'Siparişi Takip Et' : 'Track My Order';

    const content = `
        <h1 style="color: #1e1b4b; font-size: 24px; font-weight: 800; margin: 0 0 24px 0;">${titles[lang] || titles['en']}</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0;">${message}</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 24px 0 0 0;">
            ${lang === 'fr' ? 'Appareil :' : lang === 'nl' ? 'Apparaat :' : lang === 'tr' ? 'Cihaz :' : 'Device :'} 
            <strong style="color: #1e1b4b;">${formatDeviceName(quote.brand)} ${formatDeviceName(quote.model)}</strong>
        </p>
    `;

    return { subject: subjects[lang] || subjects['en'], html: LAYOUT(content, lang, trackingUrl, trackButton, id) };
};

export const getPaymentReceivedEmail = (reservation: Reservation, lang: 'en' | 'fr' | 'nl' | 'tr') => {
    const trackingUrl = `https://belmobile.be/${lang}/track-order?id=${reservation.id}&email=${encodeURIComponent(reservation.customerEmail)}`;

    const subjects: Record<string, string> = {
        en: "✅ Payment Received - Order Confirmed!",
        fr: "✅ Paiement Reçu - Commande Confirmée !",
        nl: "✅ Betaling Ontvangen - Bestelling Bevestigd!",
        tr: "✅ Ödeme Alındı - Sipariş Onaylandı!"
    };

    const titles: Record<string, string> = {
        en: "Payment Received!",
        fr: "Paiement Reçu !",
        nl: "Betaling Ontvangen !",
        tr: "Ödeme Alındı!"
    };

    const body: Record<string, string> = {
        en: `Great news! We have successfully received your payment for <strong>${reservation.productName}</strong>. We will now proceed with your order immediately.`,
        fr: `Excellente nouvelle ! Nous avons bien reçu votre paiement pour <strong>${reservation.productName}</strong>. Nous allons maintenant traiter votre commande immédiatement.`,
        nl: `Goed nieuws! We hebben uw betaling voor <strong>${reservation.productName}</strong> succesvol ontvangen. We gaan nu direct aan de slag met uw bestelling.`,
        tr: `Harika haber! <strong>${reservation.productName}</strong> için ödemenizi başarıyla aldık. Şimdi siparişinize hemen devam edeceğiz.`
    };

    const trackButton = lang === 'fr' ? 'Suivre ma commande' : lang === 'nl' ? 'Volg mijn bestelling' : lang === 'tr' ? 'Siparişi Takip Et' : 'Track My Order';

    const content = `
        <h1 style="color: #059669; font-size: 24px; font-weight: 800; margin: 0 0 24px 0;">${titles[lang] || titles['en']}</h1>
        <div style="background-color: #ecfdf5; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 32px;">
            <div style="font-size: 40px; line-height: 1;">✅</div>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0;">${body[lang] || body['en']}</p>
    `;

    return { subject: subjects[lang] || subjects['en'], html: LAYOUT(content, lang, trackingUrl, trackButton, String(reservation.id || ''), '#059669') };
};

export const getReservationStatusEmail = (reservation: Reservation, id: string, lang: 'en' | 'fr' | 'nl' | 'tr', paymentLink?: string) => {
    const isShipping = reservation.deliveryMethod === 'shipping' && reservation.status !== 'ready';
    const trackingUrl = `https://belmobile.be/${lang}/track-order?id=${id}&email=${encodeURIComponent(reservation.customerEmail)}`;
    const finalPaymentLink = paymentLink || reservation.paymentLink || '#';

    const subjects: Record<string, string> = {
        en: isShipping ? "🚨 Action Required: Payment Needed" : "🎉 Your Device is Ready!",
        fr: isShipping ? "🚨 Action Requise : Paiement Requis" : "🎉 Votre Appareil est Prêt !",
        nl: isShipping ? "🚨 Actie vereist : Betaling vereist" : "🎉 Uw Apparaat ligt Klaar !",
        tr: isShipping ? "🚨 Aksiyon Gerekli: Ödeme Gerekiyor" : "🎉 Cihazınız Hazır!"
    };

    const trackButton = lang === 'fr' ? 'Suivre ma commande' : lang === 'nl' ? 'Volg mijn bestelling' : lang === 'tr' ? 'Siparişi Takip Et' : 'Track My Order';
    const accent = isShipping ? '#10b981' : '#4338ca';

    const contentDetails = isShipping ? {
        en: { title: "Order Confirmed", body: `Your order for <strong>${reservation.productName}</strong> is verified. To finalize shipping to <strong>${reservation.shippingCity}</strong>, please complete payment below.` },
        fr: { title: "Commande Confirmée", body: `Votre commande pour <strong>${reservation.productName}</strong> est vérifiée. Pour finaliser l'expédition vers <strong>${reservation.shippingCity}</strong>, veuillez régler ci-dessous.` },
        nl: { title: "Bestelling Bevestigd", body: `Uw bestelling voor <strong>${reservation.productName}</strong> is geverifieerd. Om de verzending naar <strong>${reservation.shippingCity}</strong> te voltooien, betaal dan hieronder.` },
        tr: { title: "Sipariş Onaylandı", body: `<strong>${reservation.productName}</strong> siparişiniz doğrulandı. <strong>${reservation.shippingCity}</strong> adresine gönderimi tamamlamak için lütfen aşağıdan ödemeyi yapın.` }
    } : {
        en: { title: "Ready for Pickup!", body: `Your reservation for <strong>${reservation.productName}</strong> has been approved. You can pick it up at our shop whenever you're ready!` },
        fr: { title: "Prêt pour retrait !", body: `Votre réservation pour <strong>${reservation.productName}</strong> a été approuvée. Vous pouvez passer la récupérer en magasin quand vous le souhaitez !` },
        nl: { title: "Klaar om op te halen!", body: `Uw reservering voor <strong>${reservation.productName}</strong> is goedgekeurd. U kunt deze ophalen in de winkel wanneer u wilt!` },
        tr: { title: "Teslime Hazır!", body: `<strong>${reservation.productName}</strong> için randevunuz onaylandı. Hazır olduğunuzda mağazamızdan teslim alabilirsiniz!` }
    };

    const t = (contentDetails as any)[lang] || (contentDetails as any)['en'];

    const content = `
        <h1 style="color: ${accent}; font-size: 24px; font-weight: 800; margin: 0 0 24px 0;">${t.title}</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0;">${t.body}</p>
    `;

    return { subject: subjects[lang] || subjects['en'], html: LAYOUT(content, lang, isShipping ? finalPaymentLink : trackingUrl, isShipping ? (lang === 'fr' ? 'Payer maintenant' : lang === 'tr' ? 'Hemen Öde' : 'Pay Now') : trackButton, id, accent) };
};

export const generateReviewEmailHtml = (lang: 'en' | 'fr' | 'nl' | 'tr', name: string, shopId: string, orderId: string, shopName: string) => {
    const reviewUrl = `https://belmobile.be/${lang}/review?id=${orderId}&shop=${shopId}`;

    const subjects: Record<string, string> = {
        en: `⭐ How was your experience at ${shopName}?`,
        fr: `⭐ Comment s'est passée votre visite chez ${shopName} ?`,
        nl: `⭐ Hoe was uw ervaring bij ${shopName}?`,
        tr: `⭐ ${shopName} mağazasındaki deneyiminiz nasıldı?`
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
            body: `Bedankt voor uw bezoek aan Belmobile ${shopName}. We horen graag what u van onze diensten vond. Het duurt maar een minuutje!`,
            cta: "Beoordeling achterlaten"
        },
        tr: {
            title: "Görüşleriniz bizim için önemli",
            greeting: `Merhaba ${name},`,
            body: `Belmobile ${shopName} mağazasını seçtiğiniz için teşekkürler. Hizmetlerimiz hakkındaki düşüncelerinizi duymayı çok isteriz. Sadece bir dakikanızı alır!`,
            cta: "Yorum Yap"
        }
    };

    const t = content[lang] || content['en'];

    const htmlContent = `
        <h1 style="color: #d97706; font-size: 24px; font-weight: 800; margin: 0 0 24px 0;">${t.title}</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 16px 0;">${t.greeting}</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0;">${t.body}</p>
    `;

    return { subject, html: LAYOUT(htmlContent, lang, reviewUrl, t.cta, orderId, '#d97706') };
};

export const getOrderConfirmationEmail = (order: any, id: string, lang: 'en' | 'fr' | 'nl' | 'tr', t: any) => {
    const typeLabel = order.type === 'buyback' ? t('Buyback') : t('Repair');
    const trackingUrl = `https://belmobile.be/${lang}/track-order?id=${id}&token=${order.trackingToken}`;

    // Subjects
    const subject = t('email_buyback_repair_subject', typeLabel, id);

    // Content
    const content = `
        <h1 style="color: #4338ca; font-size: 24px; font-weight: 800; margin: 0 0 24px 0;">${t('email_buyback_repair_greeting', order.customerName)}</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0;">${t('email_buyback_repair_thanks', typeLabel)}</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 24px 0 0 0;">
            ${t('email_buyback_repair_attachment')}
        </p>
        <div style="margin-top: 32px; padding: 24px; background-color: #f1f5f9; border-radius: 16px;">
            <p style="margin: 0; font-size: 14px; font-weight: 700; color: #1e1b4b; text-transform: uppercase; letter-spacing: 1px;">${t('Device')} :</p>
            <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 800; color: #4338ca;">${formatDeviceName(order.brand)} ${formatDeviceName(order.model)}</p>
            ${order.storage ? `<p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">${order.storage}</p>` : ''}
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 32px; font-style: italic;">${t('email_automatic_message')}</p>
    `;

    return {
        subject,
        html: LAYOUT(content, lang, trackingUrl, t('email_track_button'), id, '#4338ca')
    };
};

export const getMagicLinkEmail = (email: string, magicLink: string, lang: 'en' | 'fr' | 'nl' | 'tr', deviceName: string, type: 'buyback' | 'repair' = 'buyback', id: string = 'QUOTE-SAVED') => {
    const isBuyback = type === 'buyback';
    const accentColor = isBuyback ? '#ca8a04' : '#4338ca'; // Darker yellow for text readability vs indigo

    const subjects = {
        en: isBuyback ? "✨ Resume your Sale" : "✨ Resume your Repair Quote",
        fr: isBuyback ? "✨ Reprendre votre Vente" : "✨ Retrouvez votre Devis de Réparation",
        nl: isBuyback ? "✨ Hervat uw Verkoop" : "✨ Hervat uw Reparatie Offerte",
        tr: isBuyback ? "✨ Satışınıza Devam Edin" : "✨ Onarım Teklifinize Devam Edin"
    };

    const content = {
        en: {
            title: isBuyback ? "Your Offer is Saved" : "Your Repair Quote is Saved",
            body: isBuyback
                ? `You saved a buyback offer for your <strong>${deviceName}</strong>. Prices change daily, but we've locked yours. Resume now to secure it.`
                : `You saved a repair quote for your <strong>${deviceName}</strong>. You can resume exactly where you left off. This quote is valid for 7 days.`,
            cta: isBuyback ? "Resume Selling" : "Resume Repair"
        },
        fr: {
            title: isBuyback ? "Votre Offre de Rachat est Sauvegardée" : "Votre Devis de Réparation est Sauvegardé",
            body: isBuyback
                ? `Vous avez sauvegardé une offre de rachat pour votre <strong>${deviceName}</strong>. Les prix changent quotidiennement, mais nous avons bloqué le vôtre. Reprenez maintenant pour le sécuriser.`
                : `Vous avez sauvegardé un devis de réparation pour votre <strong>${deviceName}</strong>. Vous pouvez reprendre exactement là où vous en étiez. Ce devis est valable 7 jours.`,
            cta: isBuyback ? "Reprendre la Vente" : "Reprendre la Réparation"
        },
        nl: {
            title: isBuyback ? "Uw Verkoopaanbod is Opgeslagen" : "Uw Reparatie Offerte is Opgeslagen",
            body: isBuyback
                ? `U heeft een verkoopaanbod opgeslagen voor uw <strong>${deviceName}</strong>. Prijzen veranderen dagelijks, maar die van u staat vast. Hervat nu om het te verzekeren.`
                : `U heeft een reparatie-offerte opgeslagen voor uw <strong>${deviceName}</strong>. U kunt precies verdergaan waar u gebleven was. Deze offerte is 7 dagen geldig.`,
            cta: isBuyback ? "Verkoop Hervatten" : "Reparatie Hervatten"
        },
        tr: {
            title: isBuyback ? "Satış Teklifiniz Kaydedildi" : "Onarım Teklifiniz Kaydedildi",
            body: isBuyback
                ? `<strong>${deviceName}</strong> için geri alım teklifini kaydettiniz. Fiyatlar günlük değişir, ancak sizinkini sabitledik. Şimdi devam edin.`
                : `<strong>${deviceName}</strong> için onarım teklifini kaydettiniz. Kaldığınız yerden devam edebilirsiniz. Bu teklif 7 gün geçerlidir.`,
            cta: isBuyback ? "Satışa Devam Et" : "Onarıma Devam Et"
        }
    };

    const t = content[lang] || content['en'];

    const htmlContent = `
        <h1 style="color: ${accentColor}; font-size: 24px; font-weight: 800; margin: 0 0 24px 0;">${t.title}</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">${t.body}</p>
    `;

    return {
        subject: subjects[lang] || subjects['en'],
        html: LAYOUT(htmlContent, lang, magicLink, t.cta, id, accentColor)
    };
};
