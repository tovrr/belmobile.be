// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://4ae68a58c37d14302554ea40a4e77d40@o4510604314345472.ingest.de.sentry.io/4510604327845968",
  tracesSampleRate: 1,
  enableLogs: false,
  sendDefaultPii: false,

  beforeSend(event) {
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

    // Dynamic Tags from URL
    const url = event.request?.url || '';
    const segments = url.split('/');
    const lang = segments.find(s => ['fr', 'nl', 'en'].includes(s));

    const categories = ['smartphone', 'tablet', 'laptop', 'smartwatch', 'console_home', 'console_portable'];
    const categoryMatch = segments.find(s => categories.includes(s));

    let flow = 'unknown';
    if (url.includes('/repair') || url.includes('/reparation') || url.includes('/reparatie')) flow = 'repair';
    else if (url.includes('/buyback') || url.includes('/rachat') || url.includes('/inkoop')) flow = 'buyback';

    if (lang) event.tags = { ...event.tags, lang };
    if (categoryMatch) event.tags = { ...event.tags, category: categoryMatch };
    event.tags = { ...event.tags, flow };

    return event;
  },
});
