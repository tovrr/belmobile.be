'use client';

import React, { useState } from 'react';
import {
    EnvelopeIcon,
    DevicePhoneMobileIcon,
    CheckCircleIcon,
    TruckIcon,
    CurrencyEuroIcon,
    StarIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { EmailType, Lang, EmailTemplatesConfig } from '../../types/templates';

const EMAIL_TYPES = [
    { id: 'quote_status', label: 'Order Status Update', icon: TruckIcon, color: 'text-blue-500' },
    { id: 'payment_received', label: 'Payment Received', icon: CurrencyEuroIcon, color: 'text-emerald-500' },
    { id: 'reservation_status', label: 'Reservation Update', icon: DevicePhoneMobileIcon, color: 'text-indigo-500' },
    { id: 'review_request', label: 'Review Request', icon: StarIcon, color: 'text-amber-500' },
];

const MOCK_DATA: EmailTemplatesConfig = {
    quote_status: {
        en: { subject: "📦 Update: Order #12345678", content: "We have received your request..." },
        fr: { subject: "📦 Suivi : Commande #12345678", content: "Nous avons bien reçu votre demande..." },
        nl: { subject: "📦 Status : Bestelling #12345678", content: "We hebben uw aanvraag ontvangen..." }
    },
    payment_received: {
        en: { subject: "✅ Payment Received", content: "Great news! We have received your payment..." },
        fr: { subject: "✅ Paiement Reçu", content: "Excellente nouvelle ! Nous avons reçu votre paiement..." },
        nl: { subject: "✅ Betaling Ontvangen", content: "Goed nieuws! We hebben uw betaling ontvangen..." }
    },
    reservation_status: {
        en: { subject: "🎉 Reservation Update", content: "Your device is ready..." },
        fr: { subject: "🎉 Mise à jour réservation", content: "Votre appareil est prêt..." },
        nl: { subject: "🎉 Reservering Update", content: "Uw apparaat is klaar..." }
    },
    review_request: {
        en: { subject: "⭐ Rate your experience", content: "How did we do?" },
        fr: { subject: "⭐ Notez votre expérience", content: "Comment s'est passé votre service ?" },
        nl: { subject: "⭐ Beoordeel uw ervaring", content: "Hoe hebben we het gedaan?" }
    }
};

export default function EmailTemplateManager() {
    const [selectedType, setSelectedType] = useState<EmailType>('quote_status');
    const [selectedLang, setSelectedLang] = useState<Lang>('fr');
    const [isLoading, setIsLoading] = useState(false);

    // Start with mock data or empty structure
    const [templates, setTemplates] = useState<EmailTemplatesConfig>(MOCK_DATA);

    // Load from Firestore
    React.useEffect(() => {
        const loadTemplates = async () => {
            try {
                const docRef = doc(db, 'settings', 'email_templates');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    // Merge with mock/defaults to ensure all keys exist
                    const failedLoad = docSnap.data() as EmailTemplatesConfig;
                    const merged = { ...MOCK_DATA, ...failedLoad };
                    setTemplates(merged);
                }
            } catch (err) {
                console.error("Failed to load email templates", err);
            }
        };
        loadTemplates();
    }, []);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await setDoc(doc(db, 'settings', 'email_templates'), templates);
            alert('Email templates saved successfully!');
        } catch (e) {
            console.error(e);
            alert('Failed to save templates.');
        } finally {
            setIsLoading(false);
        }
    };

    const currentTemplate = (templates as any)[selectedType]?.[selectedLang] || { subject: '', content: '' };

    const handleContentChange = (field: 'subject' | 'content', value: string) => {
        setTemplates(prev => ({
            ...prev,
            [selectedType]: {
                ...(prev as any)[selectedType],
                [selectedLang]: {
                    ...(prev as any)[selectedType]?.[selectedLang],
                    [field]: value
                }
            }
        }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar: Message Types */}
            <div className="lg:col-span-1 space-y-2">
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 px-2">Message Types</h3>
                {EMAIL_TYPES.map(type => (
                    <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id as EmailType)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${selectedType === type.id
                            ? 'bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-200 dark:ring-slate-700'
                            : 'hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-500'
                            }`}
                    >
                        <type.icon className={`w-5 h-5 ${type.color}`} />
                        <span className={`text-sm font-medium ${selectedType === type.id ? 'text-gray-900 dark:text-white' : ''}`}>
                            {type.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Editor Area */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">

                {/* Header: Language & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg self-start">
                        {(['en', 'fr', 'nl'] as Lang[]).map(lang => (
                            <button
                                key={lang}
                                onClick={() => setSelectedLang(lang)}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${selectedLang === lang
                                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => alert(`Sending test email (${selectedType}) to admin...`)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <EnvelopeIcon className="w-4 h-4" />
                            Test Send
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            {isLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Fields */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Email Subject</label>
                        <input
                            type="text"
                            value={currentTemplate.subject || ''}
                            onChange={(e) => handleContentChange('subject', e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. Your order is ready..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Body Content (HTML Allowed)</label>
                        <div className="relative">
                            <textarea
                                value={currentTemplate.content || ''}
                                onChange={(e) => handleContentChange('content', e.target.value)}
                                rows={12}
                                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500 resize-none"
                                placeholder="Write your email content here..."
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white dark:bg-slate-900 px-2 py-1 rounded shadow-sm">
                                Variables: {'{name}'}, {'{orderId}'}, {'{price}'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Hint */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
                    <div className="flex items-start gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <CheckCircleIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Master Layout Applied</h4>
                            <p className="text-xs text-gray-500 mt-1 max-w-lg">
                                All emails are automatically wrapped in the global AEGIS layout (Logo, Header, Footer, and Tracking Button). You only need to edit the core message above.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
