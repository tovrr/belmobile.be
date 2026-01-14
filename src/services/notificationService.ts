import { Quote } from '../types';
import { sendEmail } from './emailService';
import { getQuoteStatusEmail } from '../utils/emailTemplates';
import { logger } from '@/utils/logger';

export const notificationService = {
    /**
     * Send a multichannel notification to the customer.
     * Acting as the technician's "Eyes and Ears".
     */
    async notifyStatusUpdate(quote: Quote, id: string, notifyMethods: ('email' | 'whatsapp' | 'sms')[] = ['email', 'whatsapp']) {
        const lang = (quote.language || 'fr') as 'en' | 'fr' | 'nl';

        // 1. Send Email (Standard)
        if (notifyMethods.includes('email')) {
            try {
                const { subject, html } = getQuoteStatusEmail(quote, id, lang);
                await sendEmail(quote.customerEmail, subject, html);
                logger.info(`[NotificationService] Email sent to ${quote.customerEmail}`, { quoteId: id, action: 'email_sent', flow: quote.type });
            } catch (error) {
                logger.error('[NotificationService] Email failed:', { quoteId: id, action: 'email_error', flow: quote.type }, error);
            }
        }

        // 2. Send WhatsApp (Proactive - Attempt if phone is present)
        if (quote.customerPhone) {
            try {
                // Construct the "Eyes and Ears" WhatsApp message
                const message = this.getWhatsAppTemplate(quote, id, lang);

                // Dispatch to the WhatsApp API route
                const response = await fetch('/api/notifications/whatsapp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: quote.customerPhone,
                        message,
                        orderId: id
                    })
                });

                if (!response.ok) {
                    const err = await response.json();
                    logger.warn('[NotificationService] WhatsApp API issue:', { quoteId: id, action: 'whatsapp_warning', error: err });
                } else {
                    logger.info(`[NotificationService] WhatsApp sent to ${quote.customerPhone}`, { quoteId: id, action: 'whatsapp_sent', flow: quote.type });
                }
            } catch (error) {
                logger.error('[NotificationService] WhatsApp dispatch error:', { quoteId: id, action: 'whatsapp_error', flow: quote.type }, error);
            }
        }

        // 3. Send SMS (Fallback/Preference)
        if (notifyMethods.includes('sms') && quote.customerPhone) {
            try {
                // Placeholder for SMS integration. 
                // User requested cost-effective solution. 
                // We can implement logic later to check if WhatsApp failed first, then send SMS.
                logger.info(`[NotificationService] SMS requested for ${quote.customerPhone}`, { quoteId: id, action: 'sms_requested', flow: quote.type });
            } catch (error) {
                logger.error('[NotificationService] SMS dispatch error:', { quoteId: id, action: 'sms_error', flow: quote.type }, error);
            }
        }
    },

    /**
     * Get optimized WhatsApp text for the current status.
     * Personalized "Eyes and Ears" tone.
     */
    getWhatsAppTemplate(quote: Quote, id: string, lang: 'en' | 'fr' | 'nl'): string {
        const trackingUrl = quote.trackingToken
            ? `https://belmobile.be/${lang}/track/${quote.trackingToken}`
            : `https://belmobile.be/${lang}/track-order?id=${id}&email=${encodeURIComponent(quote.customerEmail)}`;
        const deviceName = `${quote.brand} ${quote.model}`.toUpperCase();

        const templates: Record<string, Record<string, string>> = {
            en: {
                greeting: `*BELMOBILE* Assistant 🛠️\nHi ${quote.customerName}, `,
                in_repair: `Great news! Our tech team has started working on your *${deviceName}*. You can follow the live progress here:`,
                repaired: `✅ Done! Your *${deviceName}* is repaired and tested. It looks great!`,
                ready: `🎉 Ready for pickup! Visit our shop during opening hours to get your device.`,
                shipped: `🚚 On its way! We've shipped your order. Track it here:`,
                footer: `\n\n_Your 'Eyes and Ears' in the shop._`
            },
            fr: {
                greeting: `*BELMOBILE* Assistant 🛠️\nBonjour ${quote.customerName}, `,
                in_repair: `Bonne nouvelle ! Nos techniciens ont commencé à travailler sur votre *${deviceName}*. Suivez l'avancement ici :`,
                repaired: `✅ Succès ! Votre *${deviceName}* est réparé et testé. Tout fonctionne parfaitement !`,
                ready: `🎉 C'est prêt ! Votre appareil vous attend en magasin. Passez quand vous voulez durant nos heures d'ouverture.`,
                shipped: `🚚 En route ! Votre commande a été expédiée. Suivez-la ici :`,
                footer: `\n\n_Votre 'Oeil en Atelier' - Belmobile._`
            },
            nl: {
                greeting: `*BELMOBILE* Assistant 🛠️\nHallo ${quote.customerName}, `,
                in_repair: `Goed nieuws! Onze technici zijn begonnen aan uw *${deviceName}*. Volg de voortgang hier:`,
                repaired: `✅ Klaar! Uw *${deviceName}* is succesvol gerepareerd en getest.`,
                ready: `🎉 Klaar om op te halen! U kunt uw toestel ophalen in de winkel tijdens de openingsuren.`,
                shipped: `🚚 Onderweg! Uw bestelling is verzonden. Volg het hier:`,
                footer: `\n\n_Uw 'Oog in het Atelier' - Belmobile._`
            }
        };

        const t = templates[lang] || templates['en'];
        let body = t[quote.status] || `Update on your ${deviceName}. Check progress:`;

        return `${t.greeting}\n\n${body}\n${trackingUrl}${t.footer}`;
    }
};
