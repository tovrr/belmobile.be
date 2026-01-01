'use client';

import React from 'react';
import { motion } from 'framer-motion';

const PARTNERS = [
    { name: 'EU Commission', delay: 0 },
    { name: 'Brussels City', delay: 0.1 },
    { name: 'Deliveroo BE', delay: 0.2 },
    { name: 'Uber Eats', delay: 0.3 },
    { name: 'Commune de Molenbeek', delay: 0.4 },
    { name: 'ULB University', delay: 0.5 },
    { name: 'VUB University', delay: 0.6 },
    { name: 'PwC Belgium', delay: 0.7 },
];

const TrustedPartnersCloud: React.FC<{ title: string }> = ({ title }) => {
    return (
        <div className="py-24 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[200px] bg-cyber-citron/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-slate-400 font-black text-xs uppercase tracking-[0.4em]"
                    >
                        {title}
                    </motion.h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {PARTNERS.map((partner, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: partner.delay, duration: 0.5 }}
                            className="flex items-center justify-center p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-cyber-citron/20 hover:bg-white/10 transition-all group grayscale hover:grayscale-0"
                        >
                            <span className="text-xl md:text-2xl font-black text-slate-500 group-hover:text-white transition-colors tracking-tighter uppercase italic">
                                {partner.name}
                            </span>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 }}
                    className="mt-16 text-center"
                >
                    <p className="text-slate-500 text-sm font-medium">
                        +492 other institutions trust Belmobile with their digital longevity.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default TrustedPartnersCloud;
