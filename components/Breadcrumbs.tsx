
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
          "item": `https://belmobile.be/${language}` // SEO Fix: Removed /#
        },
        ...pathnames.map((name, index) => {
          const path = `/${language}/${pathnames.slice(0, index + 1).join('/')}`;
          const translatedName = t(name.charAt(0).toUpperCase() + name.slice(1));
          return {
            "@type": "ListItem",
            "position": index + 2,
            "name": translatedName,
            "item": `https://belmobile.be${path}` // SEO Fix: Removed /#
          };
        })
      ]
    };

    return (
        <nav aria-label="Breadcrumb" className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ol className="flex items-center space-x-2 py-3 text-sm">
                    <li>
                        <Link to={`/${language}`} className="text-gray-500 dark:text-gray-400 hover:text-bel-blue dark:hover:text-blue-400 flex items-center transition-colors">
                            <HomeIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
                            <span className="sr-only">Home</span>
                        </Link>
                    </li>
                    {pathnames.map((name, index) => {
                        const routeTo = `/${language}/${pathnames.slice(0, index + 1).join('/')}`;
                        const isLast = index === pathnames.length - 1;
                        const translatedName = t(name.charAt(0).toUpperCase() + name.slice(1));

                        return (
                            <li key={name} className="flex items-center">
                                <ChevronRightIcon className="h-4 w-4 text-gray-400 dark:text-gray-600" aria-hidden="true" />
                                <Link
                                    to={routeTo}
                                    className={`ml-2 font-medium transition-colors ${
                                        isLast 
                                            ? 'text-gray-700 dark:text-white pointer-events-none' 
                                            : 'text-gray-500 dark:text-gray-400 hover:text-bel-blue dark:hover:text-blue-400'
                                    }`}
                                    aria-current={isLast ? 'page' : undefined}
                                >
                                    {translatedName}
                                </Link>
                            </li>
                        );
                    })}
                </ol>
            </div>
            <script type="application/ld+json">
                {JSON.stringify(breadcrumbData)}
            </script>
        </nav>
    );
};

export default Breadcrumbs;
