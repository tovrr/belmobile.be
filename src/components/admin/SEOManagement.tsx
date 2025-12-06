'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { GlobeAltIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const SEOManagement: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [keywords, setKeywords] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

    useEffect(() => {
        const fetchSEO = async () => {
            try {
                const docRef = doc(db, 'settings', 'seo');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    setKeywords(data.keywords || '');
                }
            } catch (error) {
                console.error("Error fetching SEO settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSEO();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'seo'), {
                title,
                description,
                keywords,
                updatedAt: new Date().toISOString()
            });
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error("Error saving SEO settings:", error);
            alert("Failed to save SEO settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading SEO settings...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Global SEO</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage default meta tags for the application.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                <form onSubmit={handleSave} className="max-w-3xl space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Default Page Title</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-bel-blue outline-none transition"
                                placeholder="e.g., Belmobile - Repair & Buyback"
                            />
                            <GlobeAltIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Used as the default template for all pages like "%s | {title}".</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Meta Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-bel-blue outline-none transition"
                            placeholder="e.g., The best place to repair or sell your device..."
                        />
                        <p className="text-xs text-gray-500 mt-2">Recommended length: 150-160 characters.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Keywords</label>
                        <input
                            type="text"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-bel-blue outline-none transition"
                            placeholder="e.g., repair, buyback, smartphone, belgium"
                        />
                        <p className="text-xs text-gray-500 mt-2">Comma-separated list of keywords.</p>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`flex items-center px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${saveStatus === 'saved'
                                ? 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                : 'bg-bel-blue hover:bg-blue-700 shadow-blue-200'
                                }`}
                        >
                            {saving ? 'Saving...' : saveStatus === 'saved' ? (
                                <>
                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                    Settings Saved
                                </>
                            ) : 'Save SEO Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SEOManagement;
