
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
    '/pages/rachat-gsm-bruxelles':                                       '/fr/buyback/smartphone',
    '/pages/rachat-iphone-bruxelles':                                    '/fr/buyback/smartphone/apple',
    '/pages/rachat-macbook-bruxelles':                                   '/fr/buyback/laptop/apple',
    '/pages/rachat-ipad-bruxelles':                                      '/fr/buyback/tablet/apple',
    '/pages/revendre-ordinateur-pc-portable':                            '/fr/buyback/laptop',
    '/nl/pages/revendre-ordinateur-pc-portable':                         '/nl/buyback/laptop',
    '/pages/revendre-iphone':                                            '/fr/buyback/smartphone/apple',
    '/pages/revendre-smartphone':                                        '/fr/buyback/smartphone',
    '/pages/revendre':                                                   '/fr/buyback',
    '/pages/revendre-samsung':                                           '/fr/buyback/smartphone/samsung',
    '/pages/revendre-smartwatch':                                        '/fr/buyback/smartwatch',
    '/nl/pages/revendre-smartwatch':                                     '/nl/buyback/smartwatch',
    '/pages/revendre-apple-watch':                                       '/fr/buyback/smartwatch/apple',
    '/pages/revendre-apple-ipad':                                        '/fr/buyback/tablet/apple',
    '/pages/revendre-tablette':                                          '/fr/buyback/tablet',
    '/pages/revendre-console':                                           '/fr/buyback/console',
    '/pages/revendre-sony-playstation-5':                                '/fr/buyback/console/sony/playstation-5-(disc)',
    '/pages/revendre-ps5':                                               '/fr/buyback/console/sony/playstation-5-(disc)',

    // ==========================================
    // BUYBACK - IPHONE SPECIFIC (From CSV)
    // ==========================================
    '/pages/revendre-iphone-16':             '/fr/buyback/smartphone/apple/iphone-16',
    '/pages/revendre-iphone-16-pro':         '/fr/buyback/smartphone/apple/iphone-16-pro',
    '/pages/revendre-iphone-16-pro-max':     '/fr/buyback/smartphone/apple/iphone-16-pro-max',
    
    '/pages/revendre-iphone-15':             '/fr/buyback/smartphone/apple/iphone-15',
    '/pages/revendre-iphone-15-pro':         '/fr/buyback/smartphone/apple/iphone-15-pro',
    '/pages/revendre-iphone-15-pro-max':     '/fr/buyback/smartphone/apple/iphone-15-pro-max',
    '/pages/revendre-iphone-15-plus':        '/fr/buyback/smartphone/apple/iphone-15-plus',

    '/pages/revendre-iphone-14':             '/fr/buyback/smartphone/apple/iphone-14',
    '/pages/revendre-iphone-14-pro':         '/fr/buyback/smartphone/apple/iphone-14-pro',
    '/pages/revendre-iphone-14-pro-max':     '/fr/buyback/smartphone/apple/iphone-14-pro-max',
    '/pages/revendre-iphone-14-plus':        '/fr/buyback/smartphone/apple/iphone-14-plus',

    '/pages/revendre-iphone-13':             '/fr/buyback/smartphone/apple/iphone-13',
    '/pages/revendre-iphone-13-pro':         '/fr/buyback/smartphone/apple/iphone-13-pro',
    '/pages/revendre-iphone-13-pro-max':     '/fr/buyback/smartphone/apple/iphone-13-pro-max',
    '/pages/revendre-iphone-13-mini':        '/fr/buyback/smartphone/apple/iphone-13-mini',

    '/pages/revendre-iphone-12':             '/fr/buyback/smartphone/apple/iphone-12',
    '/pages/revendre-iphone-12-pro':         '/fr/buyback/smartphone/apple/iphone-12-pro',
    '/pages/revendre-iphone-12-pro-max':     '/fr/buyback/smartphone/apple/iphone-12-pro-max',
    '/pages/revendre-iphone-12-mini':        '/fr/buyback/smartphone/apple/iphone-12-mini',

    '/pages/revendre-iphone-11':             '/fr/buyback/smartphone/apple/iphone-11',
    '/pages/revendre-iphone-11-pro':         '/fr/buyback/smartphone/apple/iphone-11-pro',
    '/pages/revendre-iphone-11-pro-max':     '/fr/buyback/smartphone/apple/iphone-11-pro-max',

    '/pages/revendre-iphone-x':              '/fr/buyback/smartphone/apple/iphone-x',
    '/pages/revendre-iphone-xs':             '/fr/buyback/smartphone/apple/iphone-xs',
    '/pages/revendre-iphone-xs-max':         '/fr/buyback/smartphone/apple/iphone-xs-max',
    '/pages/revendre-iphone-xr':             '/fr/buyback/smartphone/apple/iphone-xr',
    '/pages/revendre-iphone-se-2022':        '/fr/buyback/smartphone/apple/iphone-se-(3rd-gen)',

    // ==========================================
    // BUYBACK - SAMSUNG SPECIFIC (From CSV)
    // ==========================================
    '/pages/revendre-samsung-galaxy-s23':        '/fr/buyback/smartphone/samsung/galaxy-s23',
    '/pages/revendre-samsung-galaxy-s23-ultra':  '/fr/buyback/smartphone/samsung/galaxy-s23-ultra',
    '/pages/revendre-galaxy-s23-plus':           '/fr/buyback/smartphone/samsung/galaxy-s23+',
    '/pages/revendre-galaxy-s23-fe':             '/fr/buyback/smartphone/samsung/galaxy-s23-fe',

    '/pages/revendre-galaxy-s22':                '/fr/buyback/smartphone/samsung/galaxy-s22',
    '/pages/revendre-galaxy-s22-ultra':          '/fr/buyback/smartphone/samsung/galaxy-s22-ultra',
    '/pages/revendre-galaxy-s22-plus':           '/fr/buyback/smartphone/samsung/galaxy-s22+',

    '/pages/revendre-galaxy-s21':                '/fr/buyback/smartphone/samsung/galaxy-s21',
    '/pages/revendre-galaxy-s21-ultra':          '/fr/buyback/smartphone/samsung/galaxy-s21-ultra',
    '/pages/revendre-galaxy-s21-plus':           '/fr/buyback/smartphone/samsung/galaxy-s21+',
    '/pages/revendre-galaxy-s21-fe':             '/fr/buyback/smartphone/samsung/galaxy-s21-fe',

    '/pages/revendre-galaxy-z-flip4':            '/fr/buyback/smartphone/samsung/galaxy-z-flip4',
    '/pages/revendre-galaxy-z-flip3':            '/fr/buyback/smartphone/samsung/galaxy-z-flip3',
    '/pages/revendre-galaxy-z-fold4':            '/fr/buyback/smartphone/samsung/galaxy-z-fold4',
    '/pages/revendre-galaxy-z-fold3':            '/fr/buyback/smartphone/samsung/galaxy-z-fold3',

    // Samsung A Series (Popular)
    '/pages/revendre-samsung-galaxy-a55':        '/fr/buyback/smartphone/samsung/galaxy-a55',
    '/pages/revendre-samsung-galaxy-a54':        '/fr/buyback/smartphone/samsung/galaxy-a54',
    '/pages/revendre-samsung-galaxy-a53':        '/fr/buyback/smartphone/samsung/galaxy-a53',
    '/pages/revendre-galaxy-a52':                '/fr/buyback/smartphone/samsung/galaxy-a52',
    '/pages/revendre-galaxy-a51':                '/fr/buyback/smartphone/samsung/galaxy-a51',
    '/pages/revendre-galaxy-a50':                '/fr/buyback/smartphone/samsung/galaxy-a50',

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
    '/pages/tarifs-reparation-iphone-11':          '/fr/repair/smartphone/apple/iphone-11',
    '/pages/reparation-ecran-iphone-11':           '/fr/repair/smartphone/apple/iphone-11',
    '/pages/reparation-iphone-11-pro':             '/fr/repair/smartphone/apple/iphone-11-pro',
    '/pages/reparation-iphone-11-pro-max':         '/fr/repair/smartphone/apple/iphone-11-pro-max',
    
    // iPhone 13 Series
    '/pages/reparation-iphone-13-prix':            '/fr/repair/smartphone/apple/iphone-13',
    '/pages/reparation-iphone-13-pro':             '/fr/repair/smartphone/apple/iphone-13-pro',
    '/pages/reparation-iphone-13-pro-max':         '/fr/repair/smartphone/apple/iphone-13-pro-max',
    '/pages/reparation-iphone-13-mini':            '/fr/repair/smartphone/apple/iphone-13-mini',

    // iPhone 14 Series
    '/pages/tarifs-reparation-iphone-14-pro':      '/fr/repair/smartphone/apple/iphone-14-pro',
    '/pages/reparation-iphone-14-pro-max':         '/fr/repair/smartphone/apple/iphone-14-pro-max',
    '/pages/reparation-iphone-14-plus':            '/fr/repair/smartphone/apple/iphone-14-plus',
    '/pages/reparation-iphone-14':                 '/fr/repair/smartphone/apple/iphone-14',

    // iPhone 12 Series
    '/pages/tarifs-reparation-iphone-12':          '/fr/repair/smartphone/apple/iphone-12',
    '/pages/reparation-iphone-12-pro':             '/fr/repair/smartphone/apple/iphone-12-pro',
    '/pages/reparation-iphone-12-pro-max':         '/fr/repair/smartphone/apple/iphone-12-pro-max',
    '/pages/reparation-iphone-12-mini':            '/fr/repair/smartphone/apple/iphone-12-mini',

    // iPhone 15 Series
    '/pages/reparation-iphone-15-pro':             '/fr/repair/smartphone/apple/iphone-15-pro',
    '/pages/reparation-iphone-15-pro-max':         '/fr/repair/smartphone/apple/iphone-15-pro-max',
    '/pages/reparation-iphone-15':                 '/fr/repair/smartphone/apple/iphone-15',
    '/pages/reparation-iphone-15-plus':            '/fr/repair/smartphone/apple/iphone-15-plus',

    // iPhone X/XS/XR/SE
    '/pages/reparation-iphone-x':                  '/fr/repair/smartphone/apple/iphone-x',
    '/pages/reparation-iphone-xr':                 '/fr/repair/smartphone/apple/iphone-xr',
    '/pages/reparation-iphone-xs':                 '/fr/repair/smartphone/apple/iphone-xs',
    '/pages/reparation-iphone-xs-max':             '/fr/repair/smartphone/apple/iphone-xs-max',
    '/pages/reparation-iphone-se-2020':            '/fr/repair/smartphone/apple/iphone-se-(2020)',
    '/pages/reparation-iphone-se-2022':            '/fr/repair/smartphone/apple/iphone-se-(3rd-gen)',

    // ==========================================
    // SAMSUNG REPAIR
    // ==========================================
    
    // S Series
    '/pages/reparation-samsung-galaxy-s23-ultra':  '/fr/repair/smartphone/samsung/galaxy-s23-ultra',
    '/pages/reparation-samsung-galaxy-s23':        '/fr/repair/smartphone/samsung/galaxy-s23',
    '/pages/reparation-samsung-galaxy-s23-plus':   '/fr/repair/smartphone/samsung/galaxy-s23+',
    '/pages/reparation-samsung-galaxy-s22-ultra':  '/fr/repair/smartphone/samsung/galaxy-s22-ultra',
    '/pages/reparation-samsung-galaxy-s22':        '/fr/repair/smartphone/samsung/galaxy-s22',
    '/pages/reparation-samsung-galaxy-s22-plus':   '/fr/repair/smartphone/samsung/galaxy-s22+',
    '/pages/reparation-samsung-galaxy-s21-ultra':  '/fr/repair/smartphone/samsung/galaxy-s21-ultra',
    '/pages/reparation-galaxy-s21':                '/fr/repair/smartphone/samsung/galaxy-s21',
    '/pages/reparation-galaxy-s21-fe':             '/fr/repair/smartphone/samsung/galaxy-s21-fe',
    '/pages/reparation-galaxy-s20':                '/fr/repair/smartphone/samsung/galaxy-s20',
    '/pages/reparation-galaxy-s20-fe':             '/fr/repair/smartphone/samsung/galaxy-s20-fe',
    '/pages/reparation-galaxy-s20-ultra':          '/fr/repair/smartphone/samsung/galaxy-s20-ultra',
    '/pages/reparation-galaxy-s9':                 '/fr/repair/smartphone/samsung/galaxy-s9',
    '/pages/reparation-galaxy-s8-plus':            '/fr/repair/smartphone/samsung/galaxy-s8+',

    // A Series (High Volume)
    '/pages/reparation-samsung-galaxy-a14':        '/fr/repair/smartphone/samsung/galaxy-a14',
    '/pages/reparation-samsung-galaxy-a54':        '/fr/repair/smartphone/samsung/galaxy-a54',
    '/pages/reparation-samsung-galaxy-a53':        '/fr/repair/smartphone/samsung/galaxy-a53',
    '/pages/reparation-samsung-galaxy-a34':        '/fr/repair/smartphone/samsung/galaxy-a34',
    '/pages/reparation-galaxy-a52':                '/fr/repair/smartphone/samsung/galaxy-a52',
    '/pages/reparation-galaxy-a51':                '/fr/repair/smartphone/samsung/galaxy-a51',
    '/pages/reparation-galaxy-a50':                '/fr/repair/smartphone/samsung/galaxy-a50',
    '/pages/reparation-galaxy-a12':                '/fr/repair/smartphone/samsung/galaxy-a12',
    
    // Foldables
    '/pages/reparation-galaxy-z-flip4':            '/fr/repair/smartphone/samsung/galaxy-z-flip4',
    '/pages/reparation-galaxy-z-flip3':            '/fr/repair/smartphone/samsung/galaxy-z-flip3',
    '/pages/reparation-galaxy-z-fold3':            '/fr/repair/smartphone/samsung/galaxy-z-fold3',
    '/pages/reparation-samsung-galaxy-z-fold4':    '/fr/repair/smartphone/samsung/galaxy-z-fold4',

    // ==========================================
    // GAMING & TABLETS
    // ==========================================
    '/pages/reparation-sony-playstation-bruxelles': '/fr/repair/console/sony/playstation-5-(disc)',
    '/pages/reparation-playstation-5':             '/fr/repair/console/sony/playstation-5-(disc)',
    '/pages/reparation-playstation-4-slim-ps4-pro':'/fr/repair/console/sony/playstation-4-pro',
    '/pages/reparation-xbox-series-x':             '/fr/repair/console/xbox/xbox-series-x',
    '/pages/reparation-switch-lite-bruxelles':     '/fr/repair/console/nintendo/switch-lite',
    '/pages/reparation-switch-oled':               '/fr/repair/console/nintendo/switch-oled',
    '/pages/reparation-ipad-10':                   '/fr/repair/tablet/apple/ipad-(10th-gen)',
    '/pages/reparation-samsung-galaxy-tab-a8-10-5-2021': '/fr/repair/tablet/samsung/galaxy-tab-a8',

    // ==========================================
    // OTHER & GENERIC
    // ==========================================
    '/pages/reparation-express-smartphone-tablette-et-ordinateur-a-bruxelles': '/fr/repair',
    '/pages/reparation-smartphone-bruxelles':      '/fr/repair/smartphone',
    '/pages/reparation-ordinateur-bruxelles':      '/fr/repair/laptop',
    '/pages/reparation-console':                   '/fr/repair/console',
    '/pages/reparation-xiaomi-bruxelles':          '/fr/repair/smartphone/xiaomi',
    '/pages/reparation-huawei-bruxelles':          '/fr/repair/smartphone/huawei',
    '/pages/contact-us':                           '/fr/contact',
    '/pages/contact':                              '/fr/contact',
    '/collections/all':                            '/fr/products',
};
