import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://4ae68a58c37d14302554ea40a4e77d40@o4510604314345472.ingest.de.sentry.io/4510604327845968",
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
        Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],

    beforeSend(event) {
        // 1. PII Scrubbing
        if (event.request && event.request.data) {
            const sensitiveKeys = ['email', 'phone', 'imei', 'imei2', 'serial', 'customerName', 'address'];
            const redact = (obj: any) => {
                if (!obj || typeof obj !== 'object') return;
                Object.keys(obj).forEach(key => {
                    if (sensitiveKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
                        obj[key] = '[REDACTED]';
                    } else if (typeof obj[key] === 'object') {
                        redact(obj[key]);
                    }
                });
            };
            redact(event.request.data);
        }

        // 2. Dynamic Tags from URL
        const pathname = window.location.pathname;
        const segments = pathname.split('/');

        const lang = segments.find(s => ['fr', 'nl', 'en'].includes(s));
        const categories = ['smartphone', 'tablet', 'laptop', 'smartwatch', 'console_home', 'console_portable'];
        const categoryMatch = segments.find(s => categories.includes(s));

        let flow = 'unknown';
        if (pathname.includes('/repair') || pathname.includes('/reparation') || pathname.includes('/reparatie')) flow = 'repair';
        else if (pathname.includes('/buyback') || pathname.includes('/rachat') || pathname.includes('/inkoop')) flow = 'buyback';

        if (lang) event.tags = { ...event.tags, lang };
        if (categoryMatch) event.tags = { ...event.tags, category: categoryMatch };
        event.tags = { ...event.tags, flow };

        // Model identification (usually segment after brand or category if brand missing)
        // Basic heuristic: last segment if it's not a location
        const lastSeg = segments[segments.length - 1];
        if (lastSeg && lastSeg !== lang && lastSeg !== flow && lastSeg !== categoryMatch) {
            event.tags = { ...event.tags, model_hint: lastSeg };
        }

        return event;
    },
});
