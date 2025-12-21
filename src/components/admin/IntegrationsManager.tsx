import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, ClipboardDocumentIcon, CheckCircleIcon, ShoppingBagIcon, WrenchScrewdriverIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { RepairPriceRecord } from '../../types';

export const IntegrationsManager: React.FC = () => {
    const [generating, setGenerating] = useState(false);
    const [baseUrl, setBaseUrl] = useState('');

    useEffect(() => {
        // Client-side only
        setBaseUrl(window.location.origin);
    }, []);

    // --- CSV EXPORT LOGIC (Moved from BatchPricingTools) ---
    const handleExportCSV = async (type: 'repair' | 'buyback' | 'stock') => {
        setGenerating(true);
        try {
            let csvContent = "";
            let filename = "";

            if (type === 'repair') {
                filename = "belmobile_repair_prices.csv";
                csvContent = "Model,Issue,Price,Description\n";

                const q = query(collection(db, 'repair_prices'), where('isActive', '==', true));
                const snap = await getDocs(q);

                snap.forEach(doc => {
                    const data = doc.data() as RepairPriceRecord;
                    // Format: "iPhone 13", "Screen Replacement", "290"
                    const model = capitalizeSlug(data.deviceId);
                    const issue = capitalizeSlug(data.issueId);
                    csvContent += `"${model}","${issue}","${data.price}","Professional repair service for ${model} ${issue}"\n`;
                });

            } else if (type === 'buyback') {
                filename = "belmobile_buyback_offers.csv";
                csvContent = "Model,Storage,Condition,OfferPrice\n";

                const q = query(collection(db, 'buyback_pricing'));
                const snap = await getDocs(q);

                snap.forEach(doc => {
                    const data = doc.data() as any;
                    if (!data.price || data.price <= 0) return;
                    const model = capitalizeSlug(data.deviceId);
                    csvContent += `"${model}","${data.storage}","${data.condition}","${data.price}"\n`;
                });

            } else if (type === 'stock') {
                filename = "belmobile_product_stock.csv";
                csvContent = "ID,Name,Price,StockStatus,Availability\n";

                const q = query(collection(db, 'products'));
                const snap = await getDocs(q);

                snap.forEach(doc => {
                    const data = doc.data();
                    const totalStock = data.availability ? Object.values(data.availability as Record<string, number>).reduce((a, b) => a + (Number(b) || 0), 0) : 0;
                    csvContent += `"${data.id}","${data.name}","${data.price}","${totalStock > 0 ? 'In Stock' : 'Out of Stock'}","${totalStock}"\n`;
                });
            }

            // Download Trigger
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert(`✅ ${type.toUpperCase()} list exported successfully!`);

        } catch (e) {
            console.error("Export failed:", e);
            alert("Export failed. See console.");
        } finally {
            setGenerating(false);
        }
    };

    const capitalizeSlug = (slug: string) => {
        return slug.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">External Integrations</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage data feeds for Meta, Google, and 2dehands Marketplace.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* --- META COMMERCE --- */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <ShoppingBagIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Meta Commerce Feeds</h2>
                            <p className="text-sm text-gray-500">Facebook & Instagram (XML)</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <FeedUrlBox
                            label="Repair Services Feed"
                            url={`${baseUrl}/api/feed/meta?type=repair`}
                            onCopy={() => copyToClipboard(`${baseUrl}/api/feed/meta?type=repair`)}
                        />
                        <FeedUrlBox
                            label="Buyback Offers Feed"
                            url={`${baseUrl}/api/feed/meta?type=buyback`}
                            onCopy={() => copyToClipboard(`${baseUrl}/api/feed/meta?type=buyback`)}
                        />
                        <FeedUrlBox
                            label="Product Stock Feed"
                            url={`${baseUrl}/api/feed/meta?type=products`}
                            onCopy={() => copyToClipboard(`${baseUrl}/api/feed/meta?type=products`)}
                        />
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-500">
                        <p>ℹ️ <strong>How to use:</strong> Copy these URLs into Meta Commerce Manager &gt; Catalog &gt; Data Sources &gt; Data Feed. Set schedule to "Hourly".</p>
                    </div>
                </div>

                {/* --- 2DEHANDS / CSV --- */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <ArrowDownTrayIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manual CSV Exports</h2>
                            <p className="text-sm text-gray-500">2dehands.be / 2ememain.be</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                        Download your current inventory and pricing as CSV files formatted for bulk listing tools or manual upload.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ExportButton
                            label="Repair Prices"
                            icon={<WrenchScrewdriverIcon className="w-5 h-5" />}
                            onClick={() => handleExportCSV('repair')}
                            disabled={generating}
                        />
                        <ExportButton
                            label="Buyback Offers"
                            icon={<ArrowPathIcon className="w-5 h-5" />}
                            onClick={() => handleExportCSV('buyback')}
                            disabled={generating}
                        />
                        <ExportButton
                            label="Product Stock"
                            icon={<ShoppingBagIcon className="w-5 h-5" />}
                            onClick={() => handleExportCSV('stock')}
                            disabled={generating}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

const FeedUrlBox = ({ label, url, onCopy }: { label: string, url: string, onCopy: () => void }) => (
    <div className="group">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
        <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-xs font-mono text-gray-600 dark:text-gray-300 truncate select-all">
                {url || 'Loading...'}
            </code>
            <button
                onClick={onCopy}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Copy URL"
            >
                <ClipboardDocumentIcon className="w-4 h-4" />
            </button>
        </div>
    </div>
);

const ExportButton = ({ label, icon, onClick, disabled }: { label: string, icon: React.ReactNode, onClick: () => void, disabled: boolean }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center justify-center gap-3 px-4 py-3 bg-gray-50 dark:bg-slate-700/50 hover:bg-white border border-gray-200 dark:border-slate-600 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/10 rounded-xl transition-all disabled:opacity-50 text-sm font-bold text-gray-700 dark:text-white"
    >
        {icon}
        {label}
    </button>
);
