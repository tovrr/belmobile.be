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
import { isShopOpen } from '../utils/shopUtils';
import FadeIn from './ui/FadeIn';
import Skeleton from './ui/Skeleton';

const Contact: React.FC = () => {
    const { shops, loadingShops, sendEmail, addContactMessage } = useData();
    const { t } = useLanguage();
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [honeypot, setHoneypot] = useState('');

    // Sort shops: Active shops first, Coming Soon last
    const sortedShops = useMemo(() => {
        return [...shops].sort((a, b) => {
            // Priority 1: isPrimary shops always first
            if (a.isPrimary && !b.isPrimary) return -1;
            if (!a.isPrimary && b.isPrimary) return 1;

            // Priority 2: Not 'coming_soon' before 'coming_soon'
            if (a.status === 'coming_soon' && b.status !== 'coming_soon') return 1;
            if (a.status !== 'coming_soon' && b.status === 'coming_soon') return -1;

            // Priority 3: Alphabetical by name
            return a.name.localeCompare(b.name);
        });
    }, [shops]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (honeypot) {
            console.warn("Spam detected via honeypot");
            setSubmitted(true);
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const message = formData.get('message') as string;

        try {
            // 1. Save to Firestore for Admin Dashboard
            await addContactMessage({ name, email, message });

            // 2. Send notification to admin (info@belmobile.be)
            await sendEmail(
                'info@belmobile.be',
                t('email_contact_subject', name),
                `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #4338ca; padding: 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${t('New Contact Message')}</h1>
                    </div>
                    <div style="padding: 30px; line-height: 1.6;">
                        <p style="font-size: 16px;">${t('email_contact_body_intro')}</p>
                        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>${t('Name')}:</strong> ${name}</p>
                            <p style="margin: 5px 0;"><strong>${t('Email')}:</strong> ${email}</p>
                            <p style="margin: 20px 0 5px 0;"><strong>${t('Message')}:</strong></p>
                            <div style="font-style: italic; color: #4b5563; border-left: 4px solid #4338ca; padding-left: 15px;">
                                ${message.replace(/\n/g, '<br/>')}
                            </div>
                        </div>
                    </div>
                </div>
                `
            );

            // 3. Send confirmation to user
            await sendEmail(
                email,
                t('Message Received - Belmobile'),
                `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #4338ca; padding: 30px; text-align: center;">
                        <div style="display: inline-block; text-align: left;">
                            <div style="font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #ffffff; white-space: nowrap; margin-bottom: 2px; line-height: 1;">
                                BELMOBILE<span style="color: #eab308;">.BE</span>
                            </div>
                            <div style="font-size: 10px; font-weight: 700; letter-spacing: 5.1px; text-transform: uppercase; color: #94a3b8; white-space: nowrap; line-height: 1; padding-left: 1px;">
                                BUYBACK & REPAIR
                            </div>
                        </div>
                    </div>
                    <div style="padding: 30px; line-height: 1.6;">
                        <h2 style="color: #4338ca; margin-top: 0;">${t('Hello')} ${name},</h2>
                        <p style="font-size: 16px;">${t("Thank you for contacting us. We have successfully received your message and our team will get back to you as soon as possible.")}</p>
                        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #6b7280; font-size: 14px;">${t('Your message summary:')}</p>
                            <p style="font-style: italic; color: #4b5563; margin-top: 10px;">"${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"</p>
                        </div>
                        <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; pt: 20px;">
                            ${t('email_automatic_message')}
                        </p>
                    </div>
                    <div style="padding: 20px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e5e7eb;">
                        <p style="font-size: 14px; font-weight: bold; color: #1e293b; margin: 0;">Belmobile.be</p>
                        <p style="font-size: 12px; color: #64748b; margin: 4px 0;">Rue Gallait 4, 1030 Schaerbeek, Brussels</p>
                        <p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">
                            &copy; ${new Date().getFullYear()} Belmobile. All rights reserved.
                        </p>
                    </div>
                </div>
                `
            );

            setSubmitted(true);
        } catch (error) {
            console.error("Error handling contact submission:", error);
            alert("Sorry, there was an error sending your message. Please try again or call us directly.");
        } finally {
            setIsSubmitting(false);
        }
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
                                    <div style={{ display: 'none' }} aria-hidden="true">
                                        <input
                                            type="text"
                                            name="hp_name"
                                            tabIndex={-1}
                                            autoComplete="off"
                                            value={honeypot}
                                            onChange={(e) => setHoneypot(e.target.value)}
                                        />
                                    </div>
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
                                        disabled={isSubmitting}
                                        icon={isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <PaperAirplaneIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        )}
                                    >
                                        {isSubmitting ? t('Sending...') : t('Send Message')}
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
                            <div className="grid grid-cols-1 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-3 w-48">
                                                <Skeleton variant="text" className="h-6 w-3/4" />
                                                <Skeleton variant="text" className="h-4 w-1/2" />
                                            </div>
                                            <Skeleton variant="circle" />
                                        </div>
                                        <div className="space-y-2 mt-6">
                                            <Skeleton variant="text" className="h-4" />
                                            <Skeleton variant="text" className="h-4 w-2/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {sortedShops.map((shop, idx) => (
                                    <FadeIn key={shop.id} delay={idx * 0.1}>
                                        <div
                                            className={`
                                                relative bg-white dark:bg-slate-800 p-8 rounded-3xl border transition-all duration-300 group
                                                ${shop.isPrimary
                                                    ? 'border-bel-blue ring-2 ring-bel-blue/20 shadow-xl shadow-bel-blue/10'
                                                    : shop.status === 'coming_soon'
                                                        ? 'border-dashed border-gray-300 dark:border-slate-700 opacity-90'
                                                        : 'border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none hover:-translate-y-1 hover:border-bel-blue/30 dark:hover:border-blue-500/30'
                                                }
                                            `}
                                        >
                                            {/* Priority Badge */}
                                            {shop.badge && (
                                                <div className="absolute top-0 right-0">
                                                    <div className="bg-bel-blue text-white text-[10px] font-bold px-3 py-1 rounded-tr-3xl rounded-bl-xl uppercase tracking-tighter animate-pulse">
                                                        {shop.badge}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className={`text-xl font-bold mb-1 ${shop.status === 'coming_soon' ? 'text-gray-500 dark:text-gray-400' : 'text-bel-dark dark:text-white group-hover:text-bel-blue dark:group-hover:text-blue-400 transition-colors'}`}>
                                                        {shop.name}
                                                    </h3>
                                                    {shop.status === 'coming_soon' ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                                                            {t('Coming Soon')}
                                                        </span>
                                                    ) : shop.status === 'temporarily_closed' ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                                            <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
                                                            {t('Temporarily Closed')}
                                                        </span>
                                                    ) : isShopOpen(shop.openingHours) ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                            <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                                                            {t('Open Now')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                            <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
                                                            {t('Closed')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${shop.isPrimary ? 'bg-bel-blue text-white' : 'bg-gray-50 dark:bg-slate-700 text-gray-400 group-hover:bg-bel-blue group-hover:text-white'}`}>
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
                                                        href={shop.googleMapUrl || `https://www.google.com/maps?q=${shop.coords?.lat},${shop.coords?.lng}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 text-bel-dark dark:text-white font-semibold text-center hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm"
                                                    >
                                                        {t('Get Directions')}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </FadeIn>
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
