
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/solid';

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const { language, t } = useLanguage();
    
    const pathnames = location.pathname.split('/').filter(x => x && !['en', 'fr', 'nl'].includes(x));

    if (pathnames.length === 0 && !location.pathname.endsWith('/')) { // Only show on sub-pages
        return null;
    }

    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `https://belmobile.be/${language}`
        },
        ...pathnames.map((name, index) => {
          const path = `/${language}/${pathnames.slice(0, index + 1).join('/')}`;
          const translatedName = t(name.charAt(0).toUpperCase() + name.slice(1));
          return {
            "@type": "ListItem",
            "position": index + 2,
            "name": translatedName,
            "item": `https://belmobile.be${path}`
          };
        })
      ]
    };

    return (
        <nav aria-label="Breadcrumb" className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <ol className="flex items-center space-x-2 text-sm">
                <li>
                    <Link to={`/${language}`} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center transition-colors">
                        <HomeIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>
                {pathnames.map((name, index) => {
                    const routeTo = `/${language}/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;
                    const translatedName = t(name.charAt(0).toUpperCase() + name.slice(1));

                    return (
                        <li key={name} className="flex items-center">
                            <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            <Link
                                to={routeTo}
                                className={`ml-2 font-medium transition-colors ${
                                    isLast 
                                        ? 'text-bel-blue dark:text-blue-400 pointer-events-none' 
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                                aria-current={isLast ? 'page' : undefined}
                            >
                                {translatedName}
                            </Link>
                        </li>
                    );
                })}
            </ol>
            <script type="application/ld+json">
                {JSON.stringify(breadcrumbData)}
            </script>
        </nav>
    );
};

export default Breadcrumbs;
