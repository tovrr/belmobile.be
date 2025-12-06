'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { HomeIcon, MagnifyingGlassIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-2xl w-full text-center p-8">
                {/* 404 Text */}
                <h1 className="text-[150px] font-black text-transparent bg-clip-text bg-linear-to-r from-primary to-bel-blue leading-none select-none opacity-20 dark:opacity-40 animate-fade-in-up">
                    404
                </h1>

                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 -mt-10 animate-fade-in-up delay-100">
                    Page Not Found
                </h2>

                <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-lg mx-auto animate-fade-in-up delay-200">
                    Oops! The page you are looking for has vanished into the digital void. It might have been moved, deleted, or never existed.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
                    <Button
                        variant="primary"
                        onClick={() => router.push('/')}
                        icon={<HomeIcon className="h-5 w-5" />}
                        className="w-full sm:w-auto min-w-[160px]"
                    >
                        Go Home
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => router.push('/fr/produits')} // Defaulting to FR products for now, or could try to detect language
                        icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                        className="w-full sm:w-auto min-w-[160px]"
                    >
                        Browse Products
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => router.push('/fr/contact')}
                        icon={<EnvelopeIcon className="h-5 w-5" />}
                        className="w-full sm:w-auto min-w-[160px]"
                    >
                        Contact Support
                    </Button>
                </div>

                {/* Divider */}
                <div className="my-12 flex items-center justify-center opacity-50 animate-fade-in-up delay-500">
                    <div className="h-px bg-gray-300 dark:bg-gray-700 w-16" />
                    <span className="mx-4 text-gray-400 text-sm">BELMOBILE.BE</span>
                    <div className="h-px bg-gray-300 dark:bg-gray-700 w-16" />
                </div>
            </div>
        </div>
    );
}
