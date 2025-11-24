
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
    // BUYBACK - HIGH TRAFFIC GENERAL (From CSV)
    // ==========================================
    '/pages/rachat-reprise-revendre-cash-appareils-high-tech-bruxelles': '/fr/buyback',
    '/pages/rachat-gsm-bruxelles':                                       '/fr/buyback?device=smartphone',
    '/pages/rachat-iphone-bruxelles':                                    '/fr/buyback?device=smartphone&brand=Apple',
    '/pages/rachat-macbook-bruxelles':                                   '/fr/buyback?device=laptop&brand=Apple',
    '/pages/rachat-ipad-bruxelles':                                      '/fr/buyback?device=tablet&brand=Apple',
    '/pages/revendre-ordinateur-pc-portable':                            '/fr/buyback?device=laptop',
    '/nl/pages/revendre-ordinateur-pc-portable':                         '/nl/buyback?device=laptop',
    '/pages/revendre-iphone':                                            '/fr/buyback?device=smartphone&brand=Apple',
    '/pages/revendre-smartphone':                                        '/fr/buyback?device=smartphone',
    '/pages/revendre':                                                   '/fr/buyback',
    '/pages/revendre-samsung':                                           '/fr/buyback?device=smartphone&brand=Samsung',
    '/pages/revendre-smartwatch':                                        '/fr/buyback?device=smartwatch',
    '/nl/pages/revendre-smartwatch':                                     '/nl/buyback?device=smartwatch',
    '/pages/revendre-apple-watch':                                       '/fr/buyback?device=smartwatch&brand=Apple',
    '/pages/revendre-apple-ipad':                                        '/fr/buyback?device=tablet&brand=Apple',
    '/pages/revendre-tablette':                                          '/fr/buyback?device=tablet',
    '/pages/revendre-console':                                           '/fr/buyback?device=console',
    '/pages/revendre-sony-playstation-5':                                '/fr/buyback?device=console&brand=Sony&model=PlayStation%205%20(Disc)',
    '/pages/revendre-ps5':                                               '/fr/buyback?device=console&brand=Sony&model=PlayStation%205%20(Disc)',

    // ==========================================
    // BUYBACK - IPHONE SPECIFIC (From CSV)
    // ==========================================
    '/pages/revendre-iphone-16':             '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2016',
    '/pages/revendre-iphone-16-pro':         '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2016%20Pro',
    '/pages/revendre-iphone-16-pro-max':     '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2016%20Pro%20Max',
    
    '/pages/revendre-iphone-15':             '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2015',
    '/pages/revendre-iphone-15-pro':         '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2015%20Pro',
    '/pages/revendre-iphone-15-pro-max':     '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2015%20Pro%20Max',
    '/pages/revendre-iphone-15-plus':        '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2015%20Plus',

    '/pages/revendre-iphone-14':             '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2014',
    '/pages/revendre-iphone-14-pro':         '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2014%20Pro',
    '/pages/revendre-iphone-14-pro-max':     '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2014%20Pro%20Max',
    '/pages/revendre-iphone-14-plus':        '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2014%20Plus',

    '/pages/revendre-iphone-13':             '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2013',
    '/pages/revendre-iphone-13-pro':         '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2013%20Pro',
    '/pages/revendre-iphone-13-pro-max':     '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2013%20Pro%20Max',
    '/pages/revendre-iphone-13-mini':        '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2013%20mini',

    '/pages/revendre-iphone-12':             '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2012',
    '/pages/revendre-iphone-12-pro':         '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2012%20Pro',
    '/pages/revendre-iphone-12-pro-max':     '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2012%20Pro%20Max',
    '/pages/revendre-iphone-12-mini':        '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2012%20mini',

    '/pages/revendre-iphone-11':             '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2011',
    '/pages/revendre-iphone-11-pro':         '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2011%20Pro',
    '/pages/revendre-iphone-11-pro-max':     '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%2011%20Pro%20Max',

    '/pages/revendre-iphone-x':              '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%20X',
    '/pages/revendre-iphone-xs':             '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%20XS',
    '/pages/revendre-iphone-xs-max':         '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%20XS%20Max',
    '/pages/revendre-iphone-xr':             '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%20XR',
    '/pages/revendre-iphone-se-2022':        '/fr/buyback?device=smartphone&brand=Apple&model=iPhone%20SE%20(3rd%20Gen)',

    // ==========================================
    // BUYBACK - SAMSUNG SPECIFIC (From CSV)
    // ==========================================
    '/pages/revendre-samsung-galaxy-s23':        '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20S23',
    '/pages/revendre-samsung-galaxy-s23-ultra':  '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20S23%20Ultra',
    '/pages/revendre-galaxy-s23-plus':           '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20S23+',
    '/pages/revendre-galaxy-s23-fe':             '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20S23%20FE',

    '/pages/revendre-galaxy-s22':                '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20S22',
    '/pages/revendre-galaxy-s22-ultra':          '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20S22%20Ultra',
    '/pages/revendre-galaxy-s22-plus':           '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20S22+',

    '/pages/revendre-galaxy-s21':                '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20S21',
    '/pages/revendre-galaxy-s21-ultra':          '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20S21%20Ultra',
    '/pages/revendre-galaxy-s21-plus':           '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20S21+',
    '/pages/revendre-galaxy-s21-fe':             '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20S21%20FE',

    '/pages/revendre-galaxy-z-flip4':            '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20Z%20Flip4',
    '/pages/revendre-galaxy-z-flip3':            '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20Z%20Flip3',
    '/pages/revendre-galaxy-z-fold4':            '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20Z%20Fold4',
    '/pages/revendre-galaxy-z-fold3':            '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20Z%20Fold3',

    // Samsung A Series (Popular)
    '/pages/revendre-samsung-galaxy-a55':        '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20A55',
    '/pages/revendre-samsung-galaxy-a54':        '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20A54',
    '/pages/revendre-samsung-galaxy-a53':        '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20A53',
    '/pages/revendre-galaxy-a52':                '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20A52',
    '/pages/revendre-galaxy-a51':                '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20A51',
    '/pages/revendre-galaxy-a50':                '/fr/buyback?device=smartphone&brand=Samsung&model=Galaxy%20A50',

    // ==========================================
    // BLOG POSTS & ARTICLES (UPDATED with new IDs)
    // ==========================================
    '/blogs/news':                               '/fr/blog',
    '/blogs/articles':                           '/fr/blog',
    
    // Top Traffic Blog Mapping
    '/blogs/blog-high-tech/reparation-face-id-iphone-prix-bruxelles': '/fr/blog/4',
    '/nl/blogs/hightech-blog/reparation-face-id-iphone-prix-bruxelles': '/nl/blog/4',
    
    '/blogs/blog-high-tech/reparation-message-erreur-ecran-batterie-iphone-bruxelles': '/fr/blog/5',
    '/nl/blogs/hightech-blog/reparation-message-erreur-ecran-batterie-iphone-bruxelles': '/nl/blog/5',
    
    '/nl/blogs/hightech-blog/apple-iphone-14-pro-max-vaut-il-la-peine-dacheter': '/nl/blog/6',
    '/blogs/blog-high-tech/apple-iphone-14-pro-max-vaut-il-la-peine-dacheter': '/fr/blog/6',
    
    '/nl/blogs/hightech-blog/10-astuces-pour-booster-les-performances-de-votre-ordinateur-lent': '/nl/blog/7',
    '/blogs/blog-high-tech/10-astuces-pour-booster-les-performances-de-votre-ordinateur-lent': '/fr/blog/7',
    
    '/blogs/blog-high-tech/le-verdict-est-tombe-notre-test-complet-du-samsung-galaxy-s23-ultra': '/fr/blog/8',
    '/nl/blogs/hightech-blog/le-verdict-est-tombe-notre-test-complet-du-samsung-galaxy-s23-ultra': '/nl/blog/8',

    // Legacy Generic Mappings
    '/blogs/news/5-tips-to-extend-your-smartphone-battery-life': '/fr/blog/1',
    '/blogs/tips/conseils-batterie-smartphone':                  '/fr/blog/1',
    '/blogs/news/why-you-should-buy-refurbished':                '/fr/blog/2',
    '/blogs/guides/pourquoi-acheter-reconditionne':              '/fr/blog/2',
    '/blogs/news/dropped-phone-in-water-guide':                  '/fr/blog/3',
    '/blogs/repair/telephone-tombe-dans-eau':                    '/fr/blog/3',

    // ==========================================
    // IPHONE REPAIR (Most Important for SEO)
    // ==========================================
    
    // iPhone 11 Series (Top Traffic)
    '/pages/tarifs-reparation-iphone-11':          '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2011',
    '/pages/reparation-ecran-iphone-11':           '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2011',
    '/pages/reparation-iphone-11-pro':             '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2011%20Pro',
    '/pages/reparation-iphone-11-pro-max':         '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2011%20Pro%20Max',
    
    // iPhone 13 Series
    '/pages/reparation-iphone-13-prix':            '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2013',
    '/pages/reparation-iphone-13-pro':             '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2013%20Pro',
    '/pages/reparation-iphone-13-pro-max':         '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2013%20Pro%20Max',
    '/pages/reparation-iphone-13-mini':            '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2013%20mini',

    // iPhone 14 Series
    '/pages/tarifs-reparation-iphone-14-pro':      '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2014%20Pro',
    '/pages/reparation-iphone-14-pro-max':         '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2014%20Pro%20Max',
    '/pages/reparation-iphone-14-plus':            '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2014%20Plus',
    '/pages/reparation-iphone-14':                 '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2014',

    // iPhone 12 Series
    '/pages/tarifs-reparation-iphone-12':          '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2012',
    '/pages/reparation-iphone-12-pro':             '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2012%20Pro',
    '/pages/reparation-iphone-12-pro-max':         '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2012%20Pro%20Max',
    '/pages/reparation-iphone-12-mini':            '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2012%20mini',

    // iPhone 15 Series
    '/pages/reparation-iphone-15-pro':             '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2015%20Pro',
    '/pages/reparation-iphone-15-pro-max':         '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2015%20Pro%20Max',
    '/pages/reparation-iphone-15':                 '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2015',
    '/pages/reparation-iphone-15-plus':            '/fr/repair?device=smartphone&brand=Apple&model=iPhone%2015%20Plus',

    // iPhone X/XS/XR/SE
    '/pages/reparation-iphone-x':                  '/fr/repair?device=smartphone&brand=Apple&model=iPhone%20X',
    '/pages/reparation-iphone-xr':                 '/fr/repair?device=smartphone&brand=Apple&model=iPhone%20XR',
    '/pages/reparation-iphone-xs':                 '/fr/repair?device=smartphone&brand=Apple&model=iPhone%20XS',
    '/pages/reparation-iphone-xs-max':             '/fr/repair?device=smartphone&brand=Apple&model=iPhone%20XS%20Max',
    '/pages/reparation-iphone-se-2020':            '/fr/repair?device=smartphone&brand=Apple&model=iPhone%20SE%20(2020)',
    '/pages/reparation-iphone-se-2022':            '/fr/repair?device=smartphone&brand=Apple&model=iPhone%20SE%20(3rd%20Gen)',

    // ==========================================
    // SAMSUNG REPAIR
    // ==========================================
    
    // S Series
    '/pages/reparation-samsung-galaxy-s23-ultra':  '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S23%20Ultra',
    '/pages/reparation-samsung-galaxy-s23':        '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S23',
    '/pages/reparation-samsung-galaxy-s23-plus':   '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S23+',
    '/pages/reparation-samsung-galaxy-s22-ultra':  '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S22%20Ultra',
    '/pages/reparation-samsung-galaxy-s22':        '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S22',
    '/pages/reparation-samsung-galaxy-s22-plus':   '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S22+',
    '/pages/reparation-samsung-galaxy-s21-ultra':  '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S21%20Ultra',
    '/pages/reparation-galaxy-s21':                '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S21',
    '/pages/reparation-galaxy-s21-fe':             '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S21%20FE',
    '/pages/reparation-galaxy-s20':                '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S20',
    '/pages/reparation-galaxy-s20-fe':             '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S20%20FE',
    '/pages/reparation-galaxy-s20-ultra':          '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S20%20Ultra',
    '/pages/reparation-galaxy-s9':                 '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S9',
    '/pages/reparation-galaxy-s8-plus':            '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20S8+',

    // A Series (High Volume)
    '/pages/reparation-samsung-galaxy-a14':        '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20A14',
    '/pages/reparation-samsung-galaxy-a54':        '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20A54',
    '/pages/reparation-samsung-galaxy-a53':        '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20A53',
    '/pages/reparation-samsung-galaxy-a34':        '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20A34',
    '/pages/reparation-galaxy-a52':                '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20A52',
    '/pages/reparation-galaxy-a51':                '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20A51',
    '/pages/reparation-galaxy-a50':                '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20A50',
    '/pages/reparation-galaxy-a12':                '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20A12',
    
    // Foldables
    '/pages/reparation-galaxy-z-flip4':            '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20Z%20Flip4',
    '/pages/reparation-galaxy-z-flip3':            '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20Z%20Flip3',
    '/pages/reparation-galaxy-z-fold3':            '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20Z%20Fold3',
    '/pages/reparation-samsung-galaxy-z-fold4':    '/fr/repair?device=smartphone&brand=Samsung&model=Galaxy%20Z%20Fold4',

    // ==========================================
    // GAMING & TABLETS
    // ==========================================
    '/pages/reparation-sony-playstation-bruxelles': '/fr/repair?device=console&brand=Sony&model=PlayStation%205%20(Disc)',
    '/pages/reparation-playstation-5':             '/fr/repair?device=console&brand=Sony&model=PlayStation%205%20(Disc)',
    '/pages/reparation-playstation-4-slim-ps4-pro':'/fr/repair?device=console&brand=Sony&model=PlayStation%204%20Pro',
    '/pages/reparation-xbox-series-x':             '/fr/repair?device=console&brand=Xbox&model=Xbox%20Series%20X',
    '/pages/reparation-switch-lite-bruxelles':     '/fr/repair?device=console&brand=Nintendo&model=Switch%20Lite',
    '/pages/reparation-switch-oled':               '/fr/repair?device=console&brand=Nintendo&model=Switch%20OLED',
    '/pages/reparation-ipad-10':                   '/fr/repair?device=tablet&brand=Apple&model=iPad%20(10th%20Gen)',
    '/pages/reparation-samsung-galaxy-tab-a8-10-5-2021': '/fr/repair?device=tablet&brand=Samsung&model=Galaxy%20Tab%20A8',

    // ==========================================
    // OTHER & GENERIC
    // ==========================================
    '/pages/reparation-express-smartphone-tablette-et-ordinateur-a-bruxelles': '/fr/repair',
    '/pages/reparation-smartphone-bruxelles':      '/fr/repair?device=smartphone',
    '/pages/reparation-ordinateur-bruxelles':      '/fr/repair?device=laptop',
    '/pages/reparation-console':                   '/fr/repair?device=console',
    '/pages/reparation-xiaomi-bruxelles':          '/fr/repair?device=smartphone&brand=Xiaomi',
    '/pages/reparation-huawei-bruxelles':          '/fr/repair?device=smartphone&brand=Huawei',
    '/pages/contact-us':                           '/fr/contact',
    '/pages/contact':                              '/fr/contact',
    '/collections/all':                            '/fr/products',
};
