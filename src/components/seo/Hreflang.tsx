import React from 'react';
import { i18n } from '../../i18n-config';

interface HreflangProps {
    slugs: {
        fr: string;
        nl: string;
        en: string;
        tr: string;
    };
    baseUrl: string; // e.g., https://belmobile.be
}

const Hreflang: React.FC<HreflangProps> = ({ slugs, baseUrl }) => {
    return (
        <>
            {i18n.locales.map(locale => (
                <link
                    key={locale}
                    rel="alternate"
                    hrefLang={`${locale}-BE`}
                    href={`${baseUrl}/${locale}/${slugs[locale]}`}
                />
            ))}
            <link
                rel="alternate"
                hrefLang="x-default"
                href={`${baseUrl}/${i18n.defaultLocale}/${slugs[i18n.defaultLocale]}`}
            />
        </>
    );
};

export default Hreflang;
