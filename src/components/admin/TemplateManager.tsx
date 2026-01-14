'use client';

import React, { useState } from 'react';
import {
    PaintBrushIcon,
    DocumentTextIcon,
    SwatchIcon,
    ScaleIcon,
    ArrowPathIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { TemplateConfig } from '../../types/templates';

const LEGAL_TEMPLATES = {
    repair: `1. GARANTIE\nNos réparations sont garanties 6 mois (hors casse & oxydation). La garantie couvre uniquement la pièce remplacée.\n\n2. DONNÉES\nLe client est responsable de la sauvegarde de ses données. Belmobile décline toute responsabilité en cas de perte.\n\n3. ABANDON\nTout appareil non réclamé sous 90 jours sera considéré comme abandonné et recyclé.`,

    buyback: `1. DÉCLARATION\nLe vendeur certifie être le propriétaire légitime de l'appareil et que celui-ci n'est ni volé ni gagé.\n\n2. ÉTAT\nLe prix de rachat est définitif après inspection technique. Tout vice caché découvert ultérieurement annulera la transaction.\n\n3. CESSION\nLe vendeur cède irrévocablement la propriété de l'appareil à Belmobile contre le paiement convenu.`,

    b2b: `1. PAIEMENT\nSauf convention contraire, nos factures sont payables au comptant. Tout retard entraîne une pénalité de 10%.\n\n2. RÉSERVE DE PROPRIÉTÉ\nLes marchandises restent la propriété de Belmobile jusqu'au paiement intégral du prix.\n\n3. LITIGES\nEn cas de litige, seuls les tribunaux de Bruxelles sont compétents.`
};

const DEFAULT_CONFIG: TemplateConfig = {
    colors: {
        primary: '#4338ca',
        secondary: '#1e1b4b',
        accent: '#dc2626'
    },
    theme: 'aegis',
    prefixes: {
        order: 'ORD-',
        invoice: 'INV-'
    },
    legal: {
        repairTerms: LEGAL_TEMPLATES.repair,
        buybackTerms: LEGAL_TEMPLATES.buyback,
        b2bTerms: LEGAL_TEMPLATES.b2b,
        showOnSecondPage: true
    }
};

export default function TemplateManager() {
    const [config, setConfig] = useState<TemplateConfig>(DEFAULT_CONFIG);
    const [isSaving, setIsSaving] = useState(false);
    const [themePreview, setThemePreview] = useState<string | null>(null);

    // Load initial config
    React.useEffect(() => {
        const loadConfig = async () => {
            try {
                const docRef = doc(db, 'settings', 'templates');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setConfig(docSnap.data() as TemplateConfig);
                }
            } catch (err) {
                console.error("Failed to load template config:", err);
            }
        };
        loadConfig();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'templates'), config);
            alert('Configuration saved successfully!');
        } catch (error) {
            console.error("Error saving config:", error);
            alert('Failed to save configuration.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestPdf = async () => {
        try {
            // Import dynamically to avoid SSR issues
            const pdfGenerator = await import('../../utils/pdfGenerator');

            const mockData: any = {
                documentTitle: 'TEST DOCUMENT',
                orderId: `${config.prefixes.order}TEST-001`,
                date: new Date().toLocaleDateString('fr-BE'),
                time: new Date().toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' }),
                status: 'DRAFT',
                method: 'In Store',
                type: 'repair',
                customer: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '+32 400 00 00 00'
                },
                shopOrDevice: {
                    title: 'DEVICE DETAILS',
                    name: 'iPhone 15 Pro Max',
                    details: [
                        { label: 'Color', value: 'Black Titanium' },
                        { label: 'Storage', value: '256GB' }
                    ]
                },
                priceBreakdown: [
                    { label: 'Screen Replacement', price: 150 },
                    { label: 'Battery Service', price: 80 }
                ],
                totalPrice: 230,
                totalLabel: 'TOTAL ESTIMATED',
                labels: {
                    orderId: 'Order #',
                    date: 'Date',
                    status: 'Status',
                    method: 'Method',
                    clientDetails: 'Client Details',
                    name: 'Name',
                    email: 'Email',
                    phone: 'Phone',
                    financials: 'Financials',
                    description: 'Description',
                    price: 'Price'
                },
                nextSteps: ['Device intake', 'Technician review', 'Repair execution'],
                iban: 'BE00 0000 0000 0000'
            };

            // Generate locally in browser
            const result = await pdfGenerator.generatePDFFromPdfData(mockData, 'Test-Template');

            // Trigger download
            if (result && result.blob) {
                pdfGenerator.savePDFBlob(result.blob, result.safeFileName);
            } else {
                throw new Error("PDF generation returned no blob data");
            }

        } catch (error: any) {
            console.error('PDF Generation Error:', error);
            alert(`Failed to generate PDF preview: ${error.message || 'Unknown error'}`);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Settings Column */}
            <div className="lg:col-span-2 space-y-6">

                {/* 1. Brand Identity */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <SwatchIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Brand Identity</h2>
                            <p className="text-sm text-gray-500">Define the core color palette for generated documents.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="min-w-0">
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2 truncate">Primary Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={config.colors.primary}
                                    onChange={(e) => setConfig({ ...config, colors: { ...config.colors, primary: e.target.value } })}
                                    className="h-10 w-10 shrink-0 rounded cursor-pointer border-none bg-transparent p-0"
                                />
                                <input
                                    type="text"
                                    value={config.colors.primary}
                                    className="w-full min-w-0 bg-gray-50 dark:bg-slate-800 border-none rounded-lg text-sm font-mono px-3"
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2 truncate">Secondary Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={config.colors.secondary}
                                    onChange={(e) => setConfig({ ...config, colors: { ...config.colors, secondary: e.target.value } })}
                                    className="h-10 w-10 shrink-0 rounded cursor-pointer border-none bg-transparent p-0"
                                />
                                <input
                                    type="text"
                                    value={config.colors.secondary}
                                    className="w-full min-w-0 bg-gray-50 dark:bg-slate-800 border-none rounded-lg text-sm font-mono px-3"
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2 truncate">Accent Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={config.colors.accent}
                                    onChange={(e) => setConfig({ ...config, colors: { ...config.colors, accent: e.target.value } })}
                                    className="h-10 w-10 shrink-0 rounded cursor-pointer border-none bg-transparent p-0"
                                />
                                <input
                                    type="text"
                                    value={config.colors.accent}
                                    className="w-full min-w-0 bg-gray-50 dark:bg-slate-800 border-none rounded-lg text-sm font-mono px-3"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Sequencing & Presets */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                            <ArrowPathIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sequencing & Presets</h2>
                            <p className="text-sm text-gray-500">Manage order prefixes and layout themes.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Prefix</label>
                            <input
                                type="text"
                                value={config.prefixes.order}
                                onChange={(e) => setConfig({ ...config, prefixes: { ...config.prefixes, order: e.target.value } })}
                                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Prefix</label>
                            <input
                                type="text"
                                value={config.prefixes.invoice}
                                onChange={(e) => setConfig({ ...config, prefixes: { ...config.prefixes, invoice: e.target.value } })}
                                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">PDF Theme Preset</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setConfig({ ...config, theme: 'aegis' })}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${config.theme === 'aegis'
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                    : 'border-gray-100 dark:border-slate-700 hover:border-gray-200'
                                    }`}
                            >
                                <div className="font-bold text-gray-900 dark:text-white">Aegis V2</div>
                                <div className="text-xs text-gray-500 mt-1">Institutional, compact, ink-efficient.</div>
                            </button>
                            <button
                                onClick={() => setConfig({ ...config, theme: 'apollo' })}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${config.theme === 'apollo'
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                    : 'border-gray-100 dark:border-slate-700 hover:border-gray-200'
                                    }`}
                            >
                                <div className="font-bold text-gray-900 dark:text-white">Apollo V1</div>
                                <div className="text-xs text-gray-500 mt-1">Modern, airy, consumer-friendly.</div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Legal & Compliance */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <ScaleIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Legal & Compliance</h2>
                            <p className="text-sm text-gray-500">Manage contextual terms for different workflows.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Append to Page 2?</span>
                            <button
                                onClick={() => setConfig({ ...config, legal: { ...config.legal, showOnSecondPage: !config.legal.showOnSecondPage } })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${config.legal.showOnSecondPage ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-slate-700'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${config.legal.showOnSecondPage ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>

                        {/* Repair Terms */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold uppercase text-gray-400">Repair Terms</label>
                                <button
                                    onClick={() => setConfig({ ...config, legal: { ...config.legal, repairTerms: LEGAL_TEMPLATES.repair } })}
                                    className="text-[10px] text-emerald-600 font-medium hover:underline"
                                >
                                    Reset to Default
                                </button>
                            </div>
                            <textarea
                                value={config.legal.repairTerms}
                                onChange={(e) => setConfig({ ...config, legal: { ...config.legal, repairTerms: e.target.value } })}
                                rows={4}
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                                placeholder="Terms for standard repairs..."
                            />
                        </div>

                        {/* Buyback Terms */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold uppercase text-gray-400">Buyback Terms</label>
                                <button
                                    onClick={() => setConfig({ ...config, legal: { ...config.legal, buybackTerms: LEGAL_TEMPLATES.buyback } })}
                                    className="text-[10px] text-emerald-600 font-medium hover:underline"
                                >
                                    Reset to Default
                                </button>
                            </div>
                            <textarea
                                value={config.legal.buybackTerms}
                                onChange={(e) => setConfig({ ...config, legal: { ...config.legal, buybackTerms: e.target.value } })}
                                rows={4}
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                                placeholder="Terms for device purchase..."
                            />
                        </div>

                        {/* B2B Terms */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold uppercase text-gray-400">B2B / Invoice Terms</label>
                                <button
                                    onClick={() => setConfig({ ...config, legal: { ...config.legal, b2bTerms: LEGAL_TEMPLATES.b2b } })}
                                    className="text-[10px] text-emerald-600 font-medium hover:underline"
                                >
                                    Reset to Default
                                </button>
                            </div>
                            <textarea
                                value={config.legal.b2bTerms}
                                onChange={(e) => setConfig({ ...config, legal: { ...config.legal, b2bTerms: e.target.value } })}
                                rows={4}
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                                placeholder="Terms for professional invoices..."
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Preview Column */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 lg:sticky lg:top-8">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Preview & Actions</h2>

                    <div className="aspect-[1/1.414] bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 mb-6 flex items-center justify-center relative group overflow-hidden">
                        <div className="absolute inset-0 bg-white shadow-xl transform scale-90 origin-center transition-transform group-hover:scale-95 duration-500 overflow-hidden">
                            {/* Mock Preview - Visual representation */}
                            <div className="h-4 w-full bg-indigo-600 mb-4"></div>
                            <div className="px-4">
                                <div className="h-8 w-32 bg-gray-200 rounded mb-4" style={{ backgroundColor: config.colors.secondary }}></div>
                                <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
                                <div className="h-4 w-2/3 bg-gray-100 rounded mb-8"></div>
                                <div className="h-24 w-full bg-gray-50 rounded border border-gray-100"></div>
                            </div>
                            <div className="absolute bottom-4 right-4 h-16 w-16 bg-gray-900 rounded opacity-10"></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleTestPdf}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                        >
                            <PaintBrushIcon className="w-5 h-5" />
                            Generate Test PDF
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            ) : (
                                <CheckCircleIcon className="w-5 h-5" />
                            )}
                            Save Architecture
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">System Status</h4>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Engine Version</span>
                            <span className="font-mono font-bold">AEGIS V2.4</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-600 dark:text-gray-400">Last Compiled</span>
                            <span className="font-mono text-emerald-500">Just now</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
