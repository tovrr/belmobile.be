
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
    // IPHONE REPAIR (Most Important for SEO)
    // ==========================================

    // iPhone 11 Series (Top Traffic)
    '/pages/tarifs-reparation-iphone-11': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2011',
    '/pages/reparation-ecran-iphone-11': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2011',
    '/pages/reparation-iphone-11-pro': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2011%20Pro',
    '/pages/reparation-iphone-11-pro-max': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2011%20Pro%20Max',

    // iPhone 13 Series
    '/pages/reparation-iphone-13-prix': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2013',
    '/pages/reparation-iphone-13-pro': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2013%20Pro',
    '/pages/reparation-iphone-13-pro-max': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2013%20Pro%20Max',
    '/pages/reparation-iphone-13-mini': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2013%20mini',

    // iPhone 14 Series
    '/pages/tarifs-reparation-iphone-14-pro': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2014%20Pro',
    '/pages/reparation-iphone-14-pro-max': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2014%20Pro%20Max',
    '/pages/reparation-iphone-14-plus': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2014%20Plus',
    '/pages/reparation-iphone-14': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2014',

    // iPhone 12 Series
    '/pages/tarifs-reparation-iphone-12': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2012',
    '/pages/reparation-iphone-12-pro': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2012%20Pro',
    '/pages/reparation-iphone-12-pro-max': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2012%20Pro%20Max',
    '/pages/reparation-iphone-12-mini': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2012%20mini',

    // iPhone 15 Series
    '/pages/reparation-iphone-15-pro': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2015%20Pro',
    '/pages/reparation-iphone-15-pro-max': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2015%20Pro%20Max',
    '/pages/reparation-iphone-15': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2015',
    '/pages/reparation-iphone-15-plus': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2015%20Plus',

    // iPhone X/XS/XR/SE
    '/pages/reparation-iphone-x': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%20X',
    '/pages/reparation-iphone-xr': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%20XR',
    '/pages/reparation-iphone-xs': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%20XS',
    '/pages/reparation-iphone-xs-max': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%20XS%20Max',
    '/pages/reparation-iphone-se-2020': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%20SE%20(2020)',
    '/pages/reparation-iphone-se-2022': '/fr/repair?device=smartphone&brand=Apple&model=iPhone%20SE%20(3rd%20Gen)',

    // ==========================================
    // SAMSUNG REPAIR
    // ==========================================

    // S Series
    '/pages/reparation-samsung-galaxy-s23-ultra': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S23%20Ultra',
    '/pages/reparation-samsung-galaxy-s23': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S23',
    '/pages/reparation-samsung-galaxy-s23-plus': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S23+',
    '/pages/reparation-samsung-galaxy-s22-ultra': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S22%20Ultra',
    '/pages/reparation-samsung-galaxy-s22': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S22',
    '/pages/reparation-samsung-galaxy-s22-plus': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S22+',
    '/pages/reparation-samsung-galaxy-s21-ultra': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S21%20Ultra',
    '/pages/reparation-galaxy-s21': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S21',
    '/pages/reparation-galaxy-s21-fe': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S21%20FE',
    '/pages/reparation-galaxy-s20': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S20',
    '/pages/reparation-galaxy-s20-fe': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S20%20FE',
    '/pages/reparation-galaxy-s20-ultra': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S20%20Ultra',
    '/pages/reparation-galaxy-s9': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S9',
    '/pages/reparation-galaxy-s8-plus': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S8+',

    // A Series (High Volume)
    '/pages/reparation-samsung-galaxy-a14': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20A14',
    '/pages/reparation-samsung-galaxy-a54': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20A54',
    '/pages/reparation-samsung-galaxy-a53': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20A53',
    '/pages/reparation-samsung-galaxy-a34': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20A34',
    '/pages/reparation-galaxy-a52': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20A52',
    '/pages/reparation-galaxy-a51': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20A51',
    '/pages/reparation-galaxy-a50': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20A50',
    '/pages/reparation-galaxy-a12': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20A12',

    // Foldables
    '/pages/reparation-galaxy-z-flip4': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20Z%20Flip4',
    '/pages/reparation-galaxy-z-flip3': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20Z%20Flip3',
    '/pages/reparation-galaxy-z-fold3': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20Z%20Fold3',
    '/pages/reparation-samsung-galaxy-z-fold4': '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20Z%20Fold4',

    // ==========================================
    // GAMING & TABLETS
    // ==========================================
    '/pages/reparation-playstation-5': '/fr/repair?device=console&brand=Sony&model=PlayStation%205%20(Disc)',
    '/pages/reparation-playstation-4-slim-ps4-pro': '/fr/repair?device=console&brand=Sony&model=PlayStation%204%20Pro',
    '/pages/reparation-xbox-series-x': '/fr/repair?device=console&brand=Xbox&model=Xbox%20Series%20X',
    '/pages/reparation-switch-lite-bruxelles': '/fr/repair?device=console&brand=Nintendo&model=Switch%20Lite',
    '/pages/reparation-switch-oled': '/fr/repair?device=console&brand=Nintendo&model=Switch%20OLED',
    '/pages/reparation-ipad-10': '/fr/repair?device=tablet&brand=Apple&model=iPad%20(10th%20Gen)',
    '/pages/reparation-samsung-galaxy-tab-a8-10-5-2021': '/fr/repair?device=tablet&brand=Samsung&model=Galaxy%20Tab%20A8',
    '/reparation-ps-bruxelles': '/fr/repair?device=console&brand=Sony&model=PlayStation%205%20(Disc)',

    // ==========================================
    // OTHER & GENERIC
    // ==========================================
    '/pages/reparation-express-smartphone-tablette-et-ordinateur-a-bruxelles': '/fr/repair',
    '/pages/reparation-smartphone-bruxelles': '/fr/repair?device=smartphone',
    '/pages/reparation-ordinateur-bruxelles': '/fr/repair?device=laptop',
    '/pages/reparation-console': '/fr/repair?device=console',
    '/pages/reparation-xiaomi-bruxelles': '/fr/repair?device=smartphone&brand=Xiaomi',
    '/pages/reparation-huawei-bruxelles': '/fr/repair?device=smartphone&brand=Huawei',
    '/pages/contact-us': '/fr/contact',
    '/pages/contact': '/fr/contact',
    '/collections/all': '/fr/products',
};
