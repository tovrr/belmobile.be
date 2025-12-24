export const i18n = {
    defaultLocale: 'fr',
    locales: ['fr', 'nl', 'en'],
} as const;

export type Locale = (typeof i18n)['locales'][number];
