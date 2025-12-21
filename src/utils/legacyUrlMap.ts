
/**
 * LEGACY URL MAPPING
 * 
 * This file bridges your old SEO traffic to your new React App.
 * 
 * HOW TO USE:
 * 1. Find your old URL on the left.
 * 2. Ensure the 'model' param on the right matches EXACTLY with a key in constants.ts -> DEVICE_CATALOG.
 * 3. Use %20 for spaces. (e.g., "iPhone 13" -> "iPhone%2013")
 */

export const LEGACY_URL_MAP: Record<string, string> = {
    // ==========================================
    // Use localized slugs for redirects
    '/pages/tarifs-reparation-iphone-11': '/fr/reparation/apple/iphone-11',
    '/pages/reparation-ecran-iphone-11': '/fr/reparation/apple/iphone-11',
    '/pages/reparation-iphone-11-pro': '/fr/reparation/apple/iphone-11-pro',
    '/pages/reparation-iphone-11-pro-max': '/fr/reparation/apple/iphone-11-pro-max',

    // iPhone 13 Series
    '/pages/reparation-iphone-13-prix': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2013',
    '/pages/reparation-iphone-13-pro': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2013%20Pro',
    '/pages/reparation-iphone-13-pro-max': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2013%20Pro%20Max',
    '/pages/reparation-iphone-13-mini': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2013%20mini',

    // iPhone 14 Series
    '/pages/tarifs-reparation-iphone-14-pro': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2014%20Pro',
    '/pages/reparation-iphone-14-pro-max': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2014%20Pro%20Max',
    '/pages/reparation-iphone-14-plus': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2014%20Plus',
    '/pages/reparation-iphone-14': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2014',

    // iPhone 12 Series
    '/pages/tarifs-reparation-iphone-12': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2012',
    '/pages/reparation-iphone-12-pro': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2012%20Pro',
    '/pages/reparation-iphone-12-pro-max': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2012%20Pro%20Max',
    '/pages/reparation-iphone-12-mini': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2012%20mini',

    // iPhone 15 Series
    '/pages/reparation-iphone-15-pro': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2015%20Pro',
    '/pages/reparation-iphone-15-pro-max': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2015%20Pro%20Max',
    '/pages/reparation-iphone-15': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2015',
    '/pages/reparation-iphone-15-plus': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2015%20Plus',

    // iPhone X/XS/XR/SE
    '/pages/reparation-iphone-x': '/fr/reparation/apple/iphone-x',
    '/pages/reparation-iphone-xr': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%20XR',
    '/pages/reparation-iphone-xs': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%20XS',
    '/pages/reparation-iphone-xs-max': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%20XS%20Max',
    '/pages/reparation-iphone-se-2020': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%20SE%20(2020)',
    '/pages/reparation-iphone-se-2022': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%20SE%20(3rd%20Gen)',

    // ==========================================
    // SAMSUNG REPAIR
    // ==========================================

    // S Series
    '/pages/reparation-samsung-galaxy-s23-ultra': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20S23%20Ultra',
    '/pages/reparation-samsung-galaxy-s23': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20S23',
    '/pages/reparation-samsung-galaxy-s23-plus': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20S23+',
    '/pages/reparation-samsung-galaxy-s22-ultra': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20S22%20Ultra',
    '/pages/reparation-samsung-galaxy-s22': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20S22',
    '/pages/reparation-samsung-galaxy-s22-plus': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20S22+',
    '/pages/reparation-samsung-galaxy-s21-ultra': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20S21%20Ultra',
    '/pages/reparation-galaxy-s21': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20S21',
    '/pages/reparation-galaxy-s21-fe': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20S21%20FE',
    '/pages/reparation-galaxy-s20': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20S20',
    '/pages/reparation-galaxy-s20-fe': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20S20%20FE',
    '/pages/reparation-galaxy-s20-ultra': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20S20%20Ultra',
    '/pages/reparation-galaxy-s9': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20S9',
    '/pages/reparation-galaxy-s8-plus': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20S8+',

    // A Series (High Volume)
    '/pages/reparation-samsung-galaxy-a14': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20A14',
    '/pages/reparation-samsung-galaxy-a54': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20A54',
    '/pages/reparation-samsung-galaxy-a53': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20A53',
    '/pages/reparation-samsung-galaxy-a34': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20A34',
    '/pages/reparation-galaxy-a52': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20A52',
    '/pages/reparation-galaxy-a51': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20A51',
    '/pages/reparation-galaxy-a50': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20A50',
    '/pages/reparation-galaxy-a12': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20A12',

    // Foldables
    '/pages/reparation-galaxy-z-flip4': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20Z%20Flip4',
    '/pages/reparation-galaxy-z-flip3': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20Z%20Flip3',
    '/pages/reparation-galaxy-z-fold3': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20Z%20Fold3',
    '/pages/reparation-samsung-galaxy-z-fold4': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20Z%20Fold4',

    // ==========================================
    // GAMING & TABLETS
    // ==========================================
    '/pages/reparation-playstation-5': '/fr/reparation?device=console&brand=Sony&model=PlayStation%205%20(Disc)',
    '/pages/reparation-playstation-4-slim-ps4-pro': '/fr/reparation?device=console&brand=Sony&model=PlayStation%204%20Pro',
    '/pages/reparation-xbox-series-x': '/fr/reparation?device=console&brand=Xbox&model=Xbox%20Series%20X',
    '/pages/reparation-switch-lite-bruxelles': '/fr/reparation?device=console&brand=Nintendo&model=Switch%20Lite',
    '/reparation-switch-lite-bruxelles': '/fr/reparation?device=console&brand=Nintendo&model=Switch%20Lite',
    '/pages/reparation-switch-oled': '/fr/reparation?device=console&brand=Nintendo&model=Switch%20OLED',
    '/pages/reparation-ipad-10': '/fr/reparation?device=tablet&brand=Apple&model=iPad%20(10th%20Gen)',
    '/pages/reparation-samsung-galaxy-tab-a8-10-5-2021': '/fr/reparation?device=tablet&brand=Samsung&model=Galaxy%20Tab%20A8',
    '/reparation-ps-bruxelles': '/fr/reparation?device=console&brand=Sony&model=PlayStation%205%20(Disc)',
    '/pages/reparation-3ds-2ds-xl-bruxelles': '/fr/reparation?device=console&brand=Nintendo&model=New%203DS%20XL',

    // ==========================================
    // OTHER & GENERIC
    // ==========================================
    '/pages/reparation-express-smartphone-tablette-et-ordinateur-a-bruxelles': '/fr/reparation',
    '/pages/reparation-smartphone-bruxelles': '/fr/reparation?device=smartphone',
    '/pages/reparation-ordinateur-bruxelles': '/fr/reparation?device=laptop',
    '/pages/reparation-console': '/fr/reparation?device=console',
    '/pages/reparation-xiaomi-bruxelles': '/fr/reparation?device=smartphone&brand=Xiaomi',
    '/pages/reparation-huawei-bruxelles': '/fr/reparation?device=smartphone&brand=Huawei',
    '/pages/contact-us': '/fr/contact',
    '/pages/contact': '/fr/contact',
    '/pages/contactez-nous': '/fr/contact',
    '/pages/jobs': '/fr/jobs',
    '/pages/avis-des-clients': '/fr',
    '/pages/entreprises': '/fr/business',
    '/collections/all': '/fr/produits',
    '/collections/pieces-detachees-smartphone': '/fr/reparation',
    '/nl/pages/iphone-12-tarieven-reparatie': '/nl/reparatie?device=smartphone&brand=Apple&model=iPhone%2012',

    // Top Traffic from CSV
    //     '/pages/reparation-iphone-13-prix': '/fr/reparation?device=smartphone&brand=Apple&model=iPhone%2013',
    '/pages/rachat-gsm-bruxelles': '/fr/rachat?device=smartphone',
    '/pages/rachat-reprise-revendre-cash-appareils-high-tech-bruxelles': '/fr/rachat',
    '/pages/rachat-iphone-bruxelles': '/fr/rachat?device=smartphone&brand=Apple',
    '/nl/pages/iphone-11-tarieven-reparatie': '/nl/reparatie?device=smartphone&brand=Apple&model=iPhone%2011',
    '/pages/grossiste-accessoires-gsm-smartphone-tablette-bruxelles': '/fr/business',
    '/collections/smartphone-pas-cher-bruxelles': '/fr/produits?category=smartphone',
    '/pages/reparation-sony-playstation-bruxelles': '/fr/reparation?device=console&brand=Sony',
    '/pages/revendre-ordinateur-pc-portable': '/fr/rachat?device=laptop',
    '/pages/magasin-informatique-bruxelles': '/fr/contact',
    //     '/pages/reparation-samsung-galaxy-s23-ultra': '/fr/reparation?device=smartphone&brand=Samsung&model=Galaxy%20S23%20Ultra',
    '/collections/all/recepteurs-iptv': '/fr/produits',
    //     '/pages/reparation-switch-lite-bruxelles': '/fr/reparation?device=console&brand=Nintendo&model=Switch%20Lite',
    '/pages/demande-devis-gratuit-reparation-panne': '/fr/reparation',
    '/nl/pages/gratis-offerte-aanvraag-reparatie-defect': '/nl/reparatie',
    '/nl/pages/inkoop-ipad-brussel': '/nl/inkoop/apple/ipad',
    '/nl/pages/rachat-macbook-bruxelles': '/nl/inkoop/apple/macbook',
    '/nl/pages/verkopen': '/nl/inkoop',
    '/nl/pages/winkel-informatica-brussel': '/nl/contact',
    '/nl/pages/avis-des-clients': '/nl',
    '/nl/pages/jobs': '/nl/jobs',
    '/pages/desoxydation-smartphone-bruxelles': '/fr/reparation',
    '/pages/microsolderen-moederbord-iphone': '/fr/reparation',
    '/nl/pages/iphone-moederbord-microsolderen-brussel': '/nl/reparatie',
    '/pages/reparations-pc-portable-laptop': '/fr/reparation/computer',
    '/pages/activation-sim': '/fr/contact',
    '/pages/ups-access-point-belmobile-be': '/fr/contact',
    '/nl/pages/ups-access-point-belmobile-be': '/nl/contact',
    '/pages/recyclage-iphone': '/fr/rachat/apple',
    '/nl/pages/recyclage-iphone': '/nl/inkoop/apple',
};
