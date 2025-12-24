

export const generateReviewEmailHtml = (
    language: string,
    customerName: string,
    shopId: string,
    orderId: string,
    shopName?: string
) => {
    const baseUrl = 'https://belmobile.be'; // Can be env var
    const lang = ['fr', 'nl', 'en'].includes(language) ? language : 'en';

    // Translations
    const t = {
        en: {
            subject: 'How was your experience at Belmobile?',
            title: 'How was your experience?',
            subtitle: `Hi ${customerName}, we hope your device is working perfectly!`,
            body: `It would mean the world to us if you could share your feedback on your visit to Belmobile ${shopName || shopId}.`,
            question: 'How would you rate us?',
            footer: 'Thank you for trusting Belmobile!',
            unsubscribe: 'Unsubscribe'
        },
        fr: {
            subject: 'Votre avis compte pour nous chez Belmobile !',
            title: 'Comment s\'est passée votre expérience ?',
            subtitle: `Bonjour ${customerName}, nous espérons que votre appareil fonctionne parfaitement !`,
            body: `Cela nous ferait grand plaisir si vous pouviez partager votre avis sur votre visite chez Belmobile ${shopName || shopId}.`,
            question: 'Quelle note nous donneriez-vous ?',
            footer: 'Merci de votre confiance en Belmobile !',
            unsubscribe: 'Se désinscrire'
        },
        nl: {
            subject: 'Hoe was uw ervaring bij Belmobile?',
            title: 'Hoe was uw ervaring?',
            subtitle: `Hallo ${customerName}, we hopen dat uw apparaat weer perfect werkt!`,
            body: `Het zou veel voor ons betekenen als u uw feedback over uw bezoek aan Belmobile ${shopName || shopId} zou delen.`,
            question: 'Hoe beoordeelt u ons?',
            footer: 'Bedankt voor uw vertrouwen in Belmobile!',
            unsubscribe: 'Uitschrijven'
        }
    }[lang as 'en' | 'fr' | 'nl'];

    // Generate 5 stars
    const starsHtml = [1, 2, 3, 4, 5].map(star => {
        const link = `${baseUrl}/${lang}/feedback?stars=${star}&shopId=${shopId}&orderId=${orderId}`;
        return `
            <a href="${link}" style="text-decoration: none; margin: 0 5px;">
                <span style="font-size: 40px; color: #fbbf24; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">★</span>
            </a>
        `;
    }).join('');

    return {
        subject: t.subject,
        htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                    <td align="center" style="padding: 40px 0;">
                        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                            <!-- Header -->
                            <tr>
                                <td align="center" style="background-color: #4f46e5; padding: 40px;">
                                     <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Belmobile.be</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                                    <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 700;">${t.title}</h2>
                                    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #475569;">
                                        ${t.subtitle}
                                    </p>
                                    <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #475569;">
                                        ${t.body}
                                    </p>
                                    
                                    <div style="background-color: #f1f5f9; border-radius: 16px; padding: 30px; margin-bottom: 30px;">
                                        <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #0f172a;">${t.question}</p>
                                        <div>
                                            ${starsHtml}
                                        </div>
                                    </div>
                                    
                                    <p style="font-size: 14px; color: #94a3b8; font-style: italic;">
                                        ${t.footer}
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                    <p style="margin: 0; font-size: 12px; color: #cbd5e1;">
                                        © ${new Date().getFullYear()} Belmobile.be. All rights reserved.<br>
                                        <a href="#" style="color: #cbd5e1; text-decoration: underline;">${t.unsubscribe}</a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `
    };
};
