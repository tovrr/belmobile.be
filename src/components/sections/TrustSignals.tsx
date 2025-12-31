'use client';

import React from 'react';
import { ShieldCheckIcon, ClockIcon, LeafIcon as GlobeEuropeAfricaIcon } from '../ui/BrandIcons';
import { useLanguage } from '../../hooks/useLanguage';
import FadeIn from '../ui/FadeIn';

const TrustSignals: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="relative z-10 -mt-10 mb-20">
            <div className="container mx-auto px-4">
                <FadeIn delay={0.2} direction="up" distance={10}>
                    <div className="glass-panel bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x divide-slate-200 dark:divide-slate-700">
                            {[
                                { icon: ShieldCheckIcon, title: 'trust_warranty', desc: 'trust_warranty_desc' },
                                { icon: ClockIcon, title: 'trust_speed', desc: 'trust_speed_desc' },
                                { icon: GlobeEuropeAfricaIcon, title: 'trust_eco', desc: 'trust_eco_desc' }
                            ].map((item, i, arr) => (
                                <div key={i} className="flex flex-col items-center text-center px-4 relative">
                                    <item.icon className="h-10 w-10 text-electric-indigo mb-4" />
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t(item.title)}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{t(item.desc)}</p>

                                    {/* Centered Mobile Separator */}
                                    {i < arr.length - 1 && (
                                        <div className="md:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-px bg-slate-200 dark:bg-slate-700" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
};

export default TrustSignals;
