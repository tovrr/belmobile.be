import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email, fleetSize, estimatedSavings, language = 'en' } = await request.json();
        const apiKey = process.env.BREVO_API_KEY?.trim();

        if (!email || !apiKey) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const senderEmail = process.env.SENDER_EMAIL || "info@belmobile.be";

        // Admin notification
        const adminHtml = `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2 style="color: #4338ca;">New B2B Pro Lead</h2>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Fleet Size:</strong> ${fleetSize} devices</p>
                <p><strong>Estimated Savings:</strong> ${estimatedSavings}</p>
                <p><strong>Source:</strong> B2B Fleet Simulator</p>
                <p><strong>Language:</strong> ${language}</p>
            </div>
        `;

        // Customer thank you
        const subjects: Record<string, string> = {
            fr: "Bienvenue chez Belmobile Pro - Votre simulation de flotte",
            nl: "Welkom bij Belmobile Pro - Uw vloot simulatie",
            en: "Welcome to Belmobile Pro - Your Fleet Simulation",
            tr: "Belmobile Pro'ya Hoş Geldiniz - Filo Simülasyonunuz"
        };

        const customerContent: Record<string, any> = {
            fr: {
                title: "Optimisons votre parc mobile ensemble",
                text: `Merci pour votre intérêt envers Belmobile Pro. Selon votre simulation pour une flotte de **${fleetSize}** appareils, vous pourriez économiser environ **${estimatedSavings}** par an.`,
                cta: "Contacter un expert",
                footer: "Notre équipe B2B vous contactera prochainement."
            },
            nl: {
                title: "Laten we uw mobiele vloot samen optimaliseren",
                text: `Bedankt voor uw interesse in Belmobile Pro. Volgens uw simulatie voor een vloot van **${fleetSize}** apparaten, zou u jaarlijks ongeveer **${estimatedSavings}** kunnen besparen.`,
                cta: "Contacteer een expert",
                footer: "Ons B2B-team neemt binnenkort contact met u op."
            },
            en: {
                title: "Let's optimize your mobile fleet together",
                text: `Thank you for your interest in Belmobile Pro. According to your simulation for a fleet of **${fleetSize}** devices, you could save approximately **${estimatedSavings}** per year.`,
                cta: "Contact an Expert",
                footer: "Our B2B team will contact you shortly."
            },
            tr: {
                title: "Mobil filonuzu birlikte optimize edelim",
                text: `Belmobile Pro'ya gösterdiğiniz ilgi için teşekkür ederiz. **${fleetSize}** cihazlık filonuz için yaptığınız simülasyona göre, yıllık yaklaşık **${estimatedSavings}** tasarruf edebilirsiniz.`,
                cta: "Bir Uzmanla Görüşün",
                footer: "B2B ekibimiz kısa süre içinde sizinle iletişime geçecektir."
            }
        };

        const t = customerContent[language] || customerContent['en'];

        const customerHtml = `
            <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                <div style="background-color: #4338ca; padding: 40px 20px; text-align: center;">
                    <div style="font-size: 32px; font-weight: 900; color: #ffffff;">BELMOBILE<span style="color: #eab308;">.PRO</span></div>
                </div>
                <div style="padding: 40px;">
                    <h2 style="color: #4338ca; font-size: 24px;">${t.title}</h2>
                    <p style="font-size: 16px; line-height: 1.6;">${t.text}</p>
                    <div style="margin: 30px 0; padding: 20px; background-color: #f1f5f9; border-radius: 12px; text-align: center;">
                        <div style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Estimated Annual Savings</div>
                        <div style="font-size: 32px; font-weight: 900; color: #1e293b; margin-top: 5px;">${estimatedSavings}</div>
                    </div>
                    <p style="font-size: 14px; color: #64748b;">${t.footer}</p>
                </div>
            </div>
        `;

        // Send to Admin
        await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: { name: "Belmobile.be System", email: senderEmail },
                to: [{ email: "info@belmobile.be" }],
                subject: `[PRO LEAD] New simulator lead: ${email}`,
                htmlContent: adminHtml
            })
        });

        // Send to Customer
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: { name: "Belmobile Pro", email: senderEmail },
                to: [{ email }],
                subject: subjects[language] || subjects['en'],
                htmlContent: customerHtml
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Brevo API Error');
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('B2B lead API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
