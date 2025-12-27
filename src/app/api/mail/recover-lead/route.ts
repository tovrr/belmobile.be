import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email, name, device, price, magicLink, lang = 'fr' } = await request.json();
        const apiKey = process.env.BREVO_API_KEY?.trim();

        if (!email || !apiKey) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const senderEmail = process.env.SENDER_EMAIL || "info@belmobile.be";

        // Subject lines by language
        const subjects: Record<string, string> = {
            fr: `Belmobile - Votre offre pour ${device} n'attend que vous !`,
            nl: `Belmobile - Uw aanbieding voor ${device} wacht op u!`,
            en: `Belmobile - Your offer for ${device} is waiting for you!`
        };

        const emailHeader = `<div style="background-color: #4338ca; padding: 30px; text-align: center;"><div style="display: inline-block; text-align: left;"><div style="font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #ffffff; white-space: nowrap; margin-bottom: 2px; line-height: 1;">BELMOBILE<span style="color: #eab308;">.BE</span></div><div style="font-size: 10px; font-weight: 700; letter-spacing: 5.1px; text-transform: uppercase; color: #94a3b8; white-space: nowrap; line-height: 1; padding-left: 1px;">BUYBACK & REPAIR</div></div></div>`;
        const emailFooter = `<div style="padding: 20px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e5e7eb;"><p style="font-size: 14px; font-weight: bold; color: #1e293b; margin: 0;">Belmobile.be</p><p style="font-size: 12px; color: #64748b; margin: 4px 0;">Rue Gallait 4, 1030 Schaerbeek, Brussels</p></div>`;

        // Multi-language content
        const content: Record<string, any> = {
            fr: {
                title: `Bonjour ${name || ''},`,
                text: `Nous avons remarqué que vous n'avez pas finalisé votre demande pour votre **${device}**. Votre estimation de **${price}€** est toujours valable !`,
                button: `Finaliser ma demande`,
                footer: `Si vous avez besoin d'aide, n'hésitez pas à nous contacter.`
            },
            nl: {
                title: `Dag ${name || ''},`,
                text: `We hebben gemerkt dat u uw aanvraag voor uw **${device}** nog niet heeft afgerond. Uw schatting van **${price}€** is nog steeds geldig!`,
                button: `Rond mijn aanvraag af`,
                footer: `Als u hulp nodig heeft, aarzel dan niet om contact met ons op te nemen.`
            },
            en: {
                title: `Hello ${name || ''},`,
                text: `We noticed you didn't finish your request for your **${device}**. Your estimate of **${price}€** is still valid!`,
                button: `Complete my request`,
                footer: `If you need any help, don't hesitate to contact us.`
            }
        };

        const t = content[lang] || content['en'];

        const htmlContent = `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                ${emailHeader}
                <div style="padding: 30px; line-height: 1.6;">
                    <h2 style="color: #4338ca;">${t.title}</h2>
                    <p style="font-size: 16px;">${t.text}</p>
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${magicLink}" style="background-color: #4338ca; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            ${t.button}
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #64748b; border-top: 1px solid #f1f5f9; pt-20;">${t.footer}</p>
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
            const error = await response.text();
            throw new Error(error);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Lead recovery API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
