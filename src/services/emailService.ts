export const sendEmail = async (to: string, subject: string, html: string, attachments?: { filename: string, content: string, encoding: string }[]) => {
    const response = await fetch('/api/mail/send-confirmation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, html, attachments }),
        keepalive: true
    });

    if (!response.ok) {
        let errorData;
        const text = await response.text();
        try {
            errorData = JSON.parse(text);
        } catch {
            errorData = { error: 'Could not parse JSON', rawBody: text };
        }
        console.error('[EmailService] Email API Error:', {
            status: response.status,
            statusText: response.statusText,
            data: errorData
        });
        throw new Error(errorData.error || errorData.details || `Failed to send email (Status ${response.status})`);
    }
};
