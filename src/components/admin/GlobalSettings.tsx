'use client';

import React, { useState, useEffect } from 'react';
import { useGlobalSettings } from '../../hooks/useGlobalSettings';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { TrashIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { DEVICE_TYPES } from '../../constants';

const GlobalSettings = () => {
    return (
        <div className="p-12 text-center max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Global Settings</h1>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-4">
                    Looking for the new Robust Engine?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    This "Global Settings" page was for the <strong>legacy</strong> pricing system.
                    <br /><br />
                    We have moved all configuration (Issues, Categories, Supported Devices) directly into the
                    <strong className="text-bel-blue"> Pricing Management</strong> dashboard itself to prevent conflicts.
                </p>

                <a href="/admin/pricing" className="inline-flex items-center justify-center px-6 py-3 bg-bel-blue text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                    Go to Pricing Management →
                </a>
            </div>

            <p className="mt-8 text-xs text-gray-400">
                (This page is kept as a placeholder but is no longer used for configuration.)
            </p>
        </div>
    );
};

export default GlobalSettings;
