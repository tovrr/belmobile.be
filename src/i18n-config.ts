export const i18n = {
    defaultLocale: 'fr',
    locales: ['fr', 'nl', 'en', 'tr'],
} as const;

export type Locale = (typeof i18n)['locales'][number];
