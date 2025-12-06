'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../hooks/useLanguage';
import FAQ from '../components/FAQ';
import SchemaMarkup from '../components/SchemaMarkup';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';

const Contact: React.FC = () => {
    const { shops, loadingShops } = useData();
    const { t } = useLanguage();
    const [submitted, setSubmitted] = useState(false);

    // Sort shops: Active shops first, Coming Soon last
    const sortedShops = useMemo(() => {
        return [...shops].sort((a, b) => {
            if (a.status === 'coming_soon' && b.status !== 'coming_soon') return 1;
            if (a.status !== 'coming_soon' && b.status === 'coming_soon') return -1;
            return a.name.localeCompare(b.name);
        });
    }, [shops]);

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
        <div className="min-h-screen bg-gray-50 dark:bg-deep-space">
            <SchemaMarkup type="organization" shops={shops} />

            {/* Hero Section */}
            <div className="relative py-20 lg:py-28 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-white dark:from-slate-900/50 dark:to-deep-space z-0"></div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-bel-blue/10 text-bel-blue dark:text-blue-400 text-sm font-bold mb-6 animate-fade-in-up">
                        {t('Get in Touch')}
                    </span>
                    <h1 className="text-5xl lg:text-7xl font-extrabold text-bel-dark dark:text-white tracking-tight mb-6 animate-fade-in-up delay-100">
                        {t('Contact Us')}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-fade-in-up delay-200">
                        {t("Have a question? We'd love to hear from you.")} <br />
                        <span className="text-bel-blue dark:text-blue-400">{t('Visit a store')}</span> {t('or send us a message below.')}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

                    {/* Contact Form - Sticky */}
                    <div className="lg:sticky lg:top-32 animate-fade-in-up delay-300">
                        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-8 lg:p-10 rounded-3xl shadow-2xl border border-white/20 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/10">
                            {submitted ? (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <PaperAirplaneIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-bel-dark dark:text-white mb-4">{t('Message Sent!')}</h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-300">{t("Thank you for contacting us. We will get back to you soon.")}</p>
                                    <Button
                                        onClick={() => setSubmitted(false)}
                                        variant="ghost"
                                        className="mt-8 mx-auto"
                                    >
                                        {t('Send another message')}
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-bel-blue/10 flex items-center justify-center text-bel-blue dark:text-blue-400">
                                            <EnvelopeIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-bel-dark dark:text-white">{t('Send a Message')}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('We typically reply within 24 hours.')}</p>
                                        </div>
                                    </div>

                                    <Input
                                        id="name"
                                        name="name"
                                        label={t('Full Name')}
                                        placeholder="John Doe"
                                        required
                                    />

                                    <Input
                                        id="email"
                                        name="email"
                                        label={t('Email Address')}
                                        type="email"
                                        placeholder="john@example.com"
                                        required
                                    />

                                    <Textarea
                                        id="message"
                                        name="message"
                                        label={t('Your Message')}
                                        rows={5}
                                        placeholder="How can we help you today?"
                                        required
                                    />

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full"
                                        icon={<PaperAirplaneIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                    >
                                        {t('Send Message')}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Stores List */}
                    <div className="space-y-8 animate-fade-in-up delay-400">
                        <div>
                            <h2 className="text-3xl font-bold text-bel-dark dark:text-white mb-2">{t('Our Locations')}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{t('Find a Belmobile store near you.')}</p>
                        </div>

                        {loadingShops && shops.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-gray-300 dark:border-slate-700">
                                <div className="w-10 h-10 border-4 border-bel-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-500 dark:text-gray-400">{t('Loading stores...')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {sortedShops.map((shop, idx) => (
                                    <div
                                        key={shop.id}
                                        className={`
                                            relative bg-white dark:bg-slate-800 p-8 rounded-3xl border transition-all duration-300 group
                                            ${shop.status === 'coming_soon'
                                                ? 'border-dashed border-gray-300 dark:border-slate-700 opacity-90'
                                                : 'border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none hover:-translate-y-1 hover:border-bel-blue/30 dark:hover:border-blue-500/30'
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className={`text-xl font-bold mb-1 ${shop.status === 'coming_soon' ? 'text-gray-500 dark:text-gray-400' : 'text-bel-dark dark:text-white group-hover:text-bel-blue dark:group-hover:text-blue-400 transition-colors'}`}>
                                                    {shop.name}
                                                </h3>
                                                {shop.status === 'coming_soon' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                                                        {t('Coming Soon')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                                                        {t('Open Now')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-gray-400 group-hover:bg-bel-blue group-hover:text-white transition-all duration-300">
                                                <MapPinIcon className="w-5 h-5" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-start group/addr">
                                                <MapPinIcon className="w-5 h-5 mr-3 text-gray-400 mt-0.5 group-hover/addr:text-bel-blue transition-colors" />
                                                <span className="text-gray-600 dark:text-gray-300">{shop.address}</span>
                                            </div>
                                            {shop.phone && (
                                                <div className="flex items-center group/phone">
                                                    <PhoneIcon className="w-5 h-5 mr-3 text-gray-400 group-hover/phone:text-bel-blue transition-colors" />
                                                    <a href={`tel:${shop.phone}`} className="text-gray-600 dark:text-gray-300 hover:text-bel-dark dark:hover:text-white transition-colors">
                                                        {shop.phone}
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {shop.status !== 'coming_soon' && (
                                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex gap-4">
                                                <a
                                                    href={(shop as any).gmbUrl || `https://www.google.com/maps?q=${shop.coords?.lat},${shop.coords?.lng}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 text-bel-dark dark:text-white font-semibold text-center hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm"
                                                >
                                                    {t('Get Directions')}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-20 pt-20 border-t border-gray-200 dark:border-white/5">
                    <FAQ />
                </div>
            </div>
        </div>
    );
};

export default Contact;
