'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useData } from '../hooks/useData';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, PaperAirplaneIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../hooks/useLanguage';
import FAQ from '../components/FAQ';
import SchemaMarkup from '../components/SchemaMarkup';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Select from './ui/Select';
import Button from './ui/Button';
import { storage as firebaseStorage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { isShopOpen } from '../utils/shopUtils';
import FadeIn from './ui/FadeIn';
import Skeleton from './ui/Skeleton';

const Contact: React.FC = () => {
    const { shops, loadingShops, sendEmail, addContactMessage } = useData();
    const { t } = useLanguage();
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [honeypot, setHoneypot] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [attachmentError, setAttachmentError] = useState<string | null>(null);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setAttachmentError(null);
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setAttachmentError(t('contact_attachment_error_size') || "File too large (Max 5MB)");
                return;
            }
            setAttachment(file);
        }
    };

    const handleFileUpload = async (file: File): Promise<string> => {
        const storageRef = ref(firebaseStorage, `contact_attachments/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

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
        const phone = formData.get('phone') as string;
        const subject = formData.get('subject') as string;
        const message = formData.get('message') as string;

        try {
            let attachmentUrl = null;
            if (attachment) {
                attachmentUrl = await handleFileUpload(attachment);
            }

            // 1. Save to Firestore for Admin Dashboard (Primary)
            console.log("Submitting contact message:", { name, email, phone, subject, attachmentUrl });
            await addContactMessage({
                name,
                email,
                phone: phone || null,
                subject: subject || 'General Inquiry',
                message,
                attachmentUrl
            });

            // If we reached here, the message is SAFELY in the database.
            // We set submitted to true immediately OR after attempting emails.
            // Let's attempt emails but catch errors so they don't block the "Success" state.

            try {
                // 2. Send notification to admin (info@belmobile.be)
                await sendEmail(
                    'info@belmobile.be',
                    `[${t(`contact_subject_${subject}`)}] ${t('email_contact_subject', name)}`,
                    `
                    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #4338ca; padding: 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${t('contact_form_title')}</h1>
                        </div>
                        <div style="padding: 30px; line-height: 1.6;">
                            <p style="font-size: 16px;">${t('email_contact_body_intro')}</p>
                            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>${t('contact_full_name')}:</strong> ${name}</p>
                                <p style="margin: 5px 0;"><strong>${t('contact_email_address')}:</strong> ${email}</p>
                                ${phone ? `<p style="margin: 5px 0;"><strong>${t('contact_phone')}:</strong> ${phone}</p>` : ''}
                                <p style="margin: 5px 0;"><strong>${t('contact_subject')}:</strong> ${t(`contact_subject_${subject}`)}</p>
                                <p style="margin: 20px 0 5px 0;"><strong>${t('contact_your_message')}:</strong></p>
                                <div style="font-style: italic; color: #4b5563; border-left: 4px solid #4338ca; padding-left: 15px;">
                                    ${message.replace(/\n/g, '<br/>')}
                                </div>
                                ${attachmentUrl ? `
                                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0;"><strong>${t('contact_attachment')}:</strong></p>
                                    <a href="${attachmentUrl}" target="_blank" style="color: #4338ca; font-weight: bold; text-decoration: none;">${t('View Attachment')} &rarr;</a>
                                </div>
                                ` : ''}
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
                                <p style="font-weight: bold; margin-top: 5px;">${t('contact_subject')}: ${t(`contact_subject_${subject}`)}</p>
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
            } catch (emailError) {
                // We log the error but DON'T alert the user, because the database has the message!
                console.error("Email notification failed but message was saved to database:", emailError);
            }

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
            <SchemaMarkup type="contact" shops={shops} />

            {/* Hero Section */}
            <div className="relative py-20 lg:py-28 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-white dark:from-slate-900/50 dark:to-deep-space z-0"></div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-bel-blue/10 text-bel-blue dark:text-blue-400 text-sm font-bold mb-6 animate-fade-in-up">
                        {t('contact_hero_badge')}
                    </span>
                    <h1 className="text-5xl lg:text-7xl font-extrabold text-bel-dark dark:text-white tracking-tight mb-6 animate-fade-in-up delay-100">
                        {t('contact_hero_title')}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-fade-in-up delay-200">
                        {t('contact_hero_subtitle')} <br />
                        <span className="text-bel-blue dark:text-blue-400">{t('contact_visit_store')}</span> {t('contact_or_send')}
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
                                    <h2 className="text-3xl font-bold text-bel-dark dark:text-white mb-4">{t('contact_success_title')}</h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-300">{t('contact_success_desc')}</p>
                                    <Button
                                        onClick={() => setSubmitted(false)}
                                        variant="ghost"
                                        className="mt-8 mx-auto"
                                    >
                                        {t('contact_send_another')}
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
                                            <EnvelopeIcon className="w-6 h-6" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-bel-dark dark:text-white">{t('contact_form_title')}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('contact_form_subtitle')}</p>
                                        </div>
                                    </div>

                                    <Input
                                        id="name"
                                        name="name"
                                        label={t('contact_full_name')}
                                        placeholder={t('contact_placeholder_name')}
                                        required
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            id="email"
                                            name="email"
                                            label={t('contact_email_address')}
                                            type="email"
                                            placeholder={t('contact_placeholder_email')}
                                            required
                                        />

                                        <Input
                                            id="phone"
                                            name="phone"
                                            label={t('contact_phone')}
                                            type="tel"
                                            placeholder={t('contact_phone_placeholder')}
                                        />
                                    </div>

                                    <Select
                                        id="subject"
                                        name="subject"
                                        label={t('contact_subject')}
                                        required
                                        options={[
                                            { value: '', label: t('contact_subject_placeholder') },
                                            { value: 'info', label: t('contact_subject_info') },
                                            { value: 'tracking', label: t('contact_subject_tracking') },
                                            { value: 'complaint', label: t('contact_subject_complaint') },
                                            { value: 'other', label: t('contact_subject_other') }
                                        ]}
                                    />

                                    <Textarea
                                        id="message"
                                        name="message"
                                        label={t('contact_your_message')}
                                        rows={5}
                                        placeholder={t('contact_placeholder_message')}
                                        required
                                    />

                                    {/* File Upload */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                                            {t('contact_attachment')}
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="file"
                                                id="file-upload"
                                                className="hidden"
                                                onChange={handleFileChange}
                                                accept=".jpg,.jpeg,.png,.pdf"
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-dashed border-gray-300 dark:border-white/10"
                                            >
                                                <ArrowUpTrayIcon className="w-5 h-5" />
                                                <span>{attachment ? attachment.name : t('contact_attachment_button')}</span>
                                            </label>
                                            {attachment && (
                                                <button
                                                    type="button"
                                                    onClick={() => setAttachment(null)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                >
                                                    <XMarkIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                        {attachmentError && <p className="text-xs text-red-500 ml-1">{attachmentError}</p>}
                                        <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                            {t('contact_attachment_desc')}
                                        </p>
                                    </div>

                                    {/* Privacy Policy */}
                                    <div className="flex items-start gap-3 mt-4">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="privacy"
                                                name="privacy"
                                                type="checkbox"
                                                required
                                                checked={privacyAccepted}
                                                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                                                className="h-4 w-4 text-bel-blue border-gray-300 rounded focus:ring-bel-blue cursor-pointer"
                                            />
                                        </div>
                                        <div className="text-sm">
                                            <label htmlFor="privacy" className="text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                                                {t('contact_privacy_accept').split('{0}')[0]}
                                                <Link href="/privacy" className="text-bel-blue dark:text-blue-400 font-semibold hover:underline">
                                                    {t('contact_privacy_policy')}
                                                </Link>
                                                {t('contact_privacy_accept').split('{0}')[1]}
                                            </label>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full"
                                        disabled={isSubmitting || !privacyAccepted}
                                        icon={isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                                        ) : (
                                            <PaperAirplaneIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                                        )}
                                    >
                                        {isSubmitting ? t('contact_sending') : t('contact_send_button')}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Stores List */}
                    <div className="space-y-8 animate-fade-in-up delay-400">
                        <div>
                            <h2 className="text-3xl font-bold text-bel-dark dark:text-white mb-2">{t('contact_locations_title')}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{t('contact_locations_subtitle')}</p>
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
