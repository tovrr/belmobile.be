'use client';

import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../hooks/useLanguage';
import FAQ from '../components/FAQ';
import SchemaMarkup from '../components/SchemaMarkup';

const Contact: React.FC = () => {
    const { shops } = useData();
    const { t } = useLanguage();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const message = formData.get('message') as string;

        const subject = encodeURIComponent(`Contact: ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);

        window.location.href = `mailto:info@belmobile.be?subject=${subject}&body=${body}`;
        setSubmitted(true);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <SchemaMarkup type="organization" shops={shops} />
            <div className="text-center">
                <h1 className="text-4xl font-bold text-bel-dark dark:text-white">{t('Contact Us')}</h1>
                <p className="mt-4 text-lg text-bel-gray dark:text-gray-400">{t("Have a question? We'd love to hear from you.")}</p>
            </div>
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700">
                    {submitted ? (
                        <div className="text-center py-10">
                            <h2 className="text-2xl font-bold text-bel-dark dark:text-white">{t('Message Sent!')}</h2>
                            <p className="mt-2 text-bel-gray dark:text-gray-300">{t("Thank you for contacting us. We will get back to you soon.")}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Full Name')}</label>
                                <input type="text" name="name" id="name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-bel-blue focus:border-bel-blue sm:text-sm bg-white dark:bg-slate-700 dark:text-white" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Email')}</label>
                                <input type="email" name="email" id="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-bel-blue focus:border-bel-blue sm:text-sm bg-white dark:bg-slate-700 dark:text-white" />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Message')}</label>
                                <textarea id="message" name="message" rows={4} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-bel-blue focus:border-bel-blue sm:text-sm bg-white dark:bg-slate-700 dark:text-white"></textarea>
                            </div>
                            <div>
                                <button type="submit" className="w-full bg-bel-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 transition duration-300">
                                    {t('Send Message')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-bel-dark dark:text-white">{t('Our Locations')}</h2>
                    {shops.map(shop => (
                        <div key={shop.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-bel-blue dark:text-blue-400">{shop.name}</h3>
                            <p className="mt-2 flex items-start text-bel-gray dark:text-gray-300"><MapPinIcon className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />{shop.address}</p>
                            <p className="mt-2 flex items-center text-bel-gray dark:text-gray-300"><PhoneIcon className="h-5 w-5 mr-3 flex-shrink-0" />{shop.phone}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="py-8">
                <FAQ />
            </div>
        </div>
    );
};

export default Contact;
