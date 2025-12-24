'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function ProtectedPage() {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const params = useParams();
    const lang = params.lang as string || 'fr';

    const translations = {
        en: {
            title: 'Environment Protected',
            subtitle: 'This is a private staging environment for Belmobile.',
            placeholder: 'Enter PIN',
            submit: 'Unlock Access',
            hint: 'HINT: Middle row down',
            error: 'Invalid PIN. Please try again.',
        },
        fr: {
            title: 'Environnement Protégé',
            subtitle: 'Ceci est un environnement de test privé pour Belmobile.',
            placeholder: 'Entrer le PIN',
            submit: 'Déverrouiller',
            hint: 'INDICE : Colonne du milieu (2580)',
            error: 'PIN invalide. Veuillez réessayer.',
        },
        nl: {
            title: 'Beveiligde Omgeving',
            subtitle: 'Dit is een privé testomgeving voor Belmobile.',
            placeholder: 'Voer PIN in',
            submit: 'Toegang Ontgrendelen',
            hint: 'HINT: Middelste rij naar beneden',
            error: 'Ongeldige PIN. Probeer het opnieuw.',
        }
    };

    const t = translations[lang as keyof typeof translations] || translations.fr;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setError(false);

        // The middleware handles the cookie after we append ?pin= to the URL
        // We just need to trigger a reload with the parameter
        if (pin === '2580') {
            window.location.href = `/${lang}?pin=2580`;
        } else {
            setTimeout(() => {
                setError(true);
                setIsLoading(false);
                setPin('');
            }, 500);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans antialiased text-white">
            {/* Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative w-full max-w-md transform transition-all duration-700 ease-out opacity-100 scale-100">
                {/* Card */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    {/* Top Icon */}
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                        <LockClosedIcon className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-center mb-3 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                        {t.title}
                    </h1>
                    <p className="text-white/40 text-center mb-10 text-lg leading-relaxed font-medium">
                        {t.subtitle}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder={t.placeholder}
                                className={`w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-6 py-5 text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:tracking-normal placeholder:text-white/20`}
                                autoFocus
                                maxLength={4}
                            />
                            {error && (
                                <p className="text-red-400 text-sm text-center mt-3 font-medium animate-shake">
                                    {t.error}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || pin.length < 4}
                            className="w-full bg-white text-black font-bold py-5 rounded-2xl hover:bg-white/90 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all text-lg shadow-xl shadow-white/5 flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-3 border-black/10 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    <ShieldCheckIcon className="w-6 h-6" />
                                    {t.submit}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Hint Footer */}
                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <p className="text-white/20 text-sm font-medium">
                            {t.hint}
                        </p>
                    </div>
                </div>

                {/* Branding */}
                <div className="mt-8 flex items-center justify-center gap-2 opacity-30">
                    <span className="text-sm font-bold tracking-widest uppercase">Belmobile</span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <span className="text-sm font-medium">Staging v2.0</span>
                </div>
            </div>
        </div>
    );
}
