import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email, name, device, price, magicLink, lang = 'fr' } = await request.json();
        const apiKey = process.env.BREVO_API_KEY?.trim();

        if (!email || !apiKey) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const senderEmail = process.env.SENDER_EMAIL || "info@belmobile.be";

        // AEGIS: Localized Subjects with emotional resonance
        const subjects: Record<string, string> = {
            fr: `Belmobile - Votre estimation pour ${device} est prête !`,
            nl: `Belmobile - Uw schatting voor ${device} staat klaar!`,
            en: `Belmobile - Your estimate for ${device} is ready!`
        };

        const emailHeader = `
            <div style="background-color: #4338ca; padding: 40px 20px; text-align: center; border-radius: 16px 16px 0 0;">
                <div style="display: inline-block; text-align: left;">
                    <div style="font-size: 32px; font-weight: 900; letter-spacing: -1.5px; color: #ffffff; white-space: nowrap; margin-bottom: 2px; line-height: 1;">
                        BELMOBILE<span style="color: #eab308;">.BE</span>
                    </div>
                    <div style="font-size: 11px; font-weight: 700; letter-spacing: 5.5px; text-transform: uppercase; color: #94a3b8; white-space: nowrap; line-height: 1; padding-left: 2px;">
                        ESTIMATION & REPAIR
                    </div>
                </div>
            </div>
        `;

        const emailFooter = `
            <div style="padding: 30px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px;">
                <p style="font-size: 14px; font-weight: bold; color: #1e293b; margin: 0;">Belmobile.be</p>
                <p style="font-size: 12px; color: #64748b; margin: 6px 0;">Rue Gallait 4, 1030 Schaerbeek, Brussels</p>
                <p style="font-size: 11px; color: #94a3b8; margin-top: 15px;">&copy; ${new Date().getFullYear()} Belmobile. Prepared with care.</p>
            </div>
        `;

        const content: Record<string, any> = {
            fr: {
                title: `Bonjour ${name || 'cher client'},`,
                text: `Nous avons remarqué que vous n'avez pas finalisé votre demande pour votre **${device}**. <br><br>Bonne nouvelle : votre estimation de <strong>${price}€</strong> a été sauvegardée et vous attend !`,
                button: `Finaliser ma demande`,
                footer: `Besoin d'aide ? Répondez simplement à cet email, nos experts sont à votre disposition.`
            },
            nl: {
                title: `Dag ${name || 'beste klant'},`,
                text: `We hebben gemerkt dat u uw aanvraag voor uw **${device}** nog niet heeft afgerond. <br><br>Goed nieuws: uw schatting van <strong>${price}€</strong> is opgeslagen en wacht op u!`,
                button: `Kaldığım Yerden Devam Et`, // Turkish twist for the user context if needed, or stick to NL
                subButton: `Rond mijn aanvraag af`,
                footer: `Hulp nodig? Beantwoord deze e-mail, onze experts staan voor u klaar.`
            },
            en: {
                title: `Hello ${name || 'there'},`,
                text: `We noticed you didn't finish your request for your **${device}**. <br><br>Good news: your estimate of <strong>${price}€</strong> has been saved and is waiting for you!`,
                button: `Complete my request`,
                footer: `Need help? Just reply to this email, our experts are here for you.`
            }
        };

        const t = content[lang] || content['en'];

        const htmlContent = `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                ${emailHeader}
                <div style="padding: 40px; line-height: 1.7;">
                    <h2 style="color: #4338ca; font-size: 24px; margin-top: 0;">${t.title}</h2>
                    <p style="font-size: 16px; color: #475569;">${t.text}</p>
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${magicLink}" style="background-color: #4338ca; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(67, 56, 202, 0.25);">
                            ${lang === 'nl' && t.button ? t.button : t.button}
                        </a>
                    </div>
                    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin-top: 30px;">
                        <p style="font-size: 14px; color: #64748b; margin: 0; text-align: center;">${t.footer}</p>
                    </div>
                </div>
                ${emailFooter}
            </div>
        `;

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: { name: "Belmobile.be", email: senderEmail },
                to: [{ email }],
                subject: subjects[lang] || subjects['en'],
                htmlContent: htmlContent
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Brevo API Error');
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Lead recovery API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
