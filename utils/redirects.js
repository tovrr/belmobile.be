// utils/redirects.js

export const redirects = [
    // --- Generic Regex Redirects ---
    // Example: /collections/some-collection -> /products?collection=some-collection
    { from: /^\/collections\/(.*)/, to: '/products?collection=$1' },
    // Redirect old product pages if the structure is the same
    { from: /^\/products\/(.*)/, to: '/products/$1' },

    // --- Individual Page Redirects ---
    // Generic pages
    { from: '/pages/rachat-gsm-bruxelles', to: '/buyback' },
    { from: '/pages/rachat-reprise-revendre-cash-appareils-high-tech-bruxelles', to: '/buyback' },
    { from: '/pages/reparation-smartphone-bruxelles', to: '/repair' },
    { from: '/pages/contactez-nous', to: '/contact' },
    { from: '/pages/grossiste-accessoires-gsm-smartphone-tablette-bruxelles', to: '/franchise' },
    { from: '/pages/reparation-express-smartphone-tablette-et-ordinateur-a-bruxelles', to: '/repair' },
    { from: '/pages/avis-des-clients', to: '/' }, // No reviews page, redirect to home
    { from: '/pages/jobs', to: '/franchise' }, // Redirect jobs to franchise page

    // Specific repair/buyback pages
    { from: '/pages/tarifs-reparation-iphone-11', to: '/repair/smartphone/Apple/iphone-11' },
    { from: '/pages/reparation-playstation-5', to: '/repair/console/Sony/playstation-5' },
    { from: '/pages/rachat-iphone-bruxelles', to: '/buyback/smartphone/Apple' },
    { from: '/pages/reparation-iphone-13-prix', to: '/repair/smartphone/Apple/iphone-13' },
    { from: '/pages/tarifs-reparation-iphone-14-pro', to: '/repair/smartphone/Apple/iphone-14-pro' },
    { from: '/pages/tarifs-reparation-iphone-12', to: '/repair/smartphone/Apple/iphone-12' },
    { from: '/pages/reparation-iphone-x', to: '/repair/smartphone/Apple/iphone-x' },
    { from: '/pages/revendre-iphone', to: '/buyback/smartphone/Apple' },
    { from: '/pages/reparation-samsung-galaxy-s22-ultra', to: '/repair/smartphone/Samsung/galaxy-s22-ultra' },
    { from: '/pages/reparation-3ds-2ds-xl-bruxelles', to: '/repair/console/Nintendo/3ds' },
    { from: '/nl/pages/iphone-11-tarieven-reparatie', to: '/nl/repair/smartphone/Apple/iphone-11' },
];
