'use client';

import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import {
    MOCK_SHOPS,
    MOCK_PRODUCTS,
    MOCK_REPAIR_PRICES,
    MOCK_BLOG_POSTS,
    MOCK_SERVICES,
    MOCK_FAQ_CATEGORIES
} from '../constants';

export default function MigrateData() {
    const [status, setStatus] = useState<string>('Idle');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const migrateShops = async () => {
        addLog('Starting Shops Migration...');
        const batch = writeBatch(db);
        MOCK_SHOPS.forEach(shop => {
            const ref = doc(db, 'shops', String(shop.id));
            batch.set(ref, shop);
        });
        await batch.commit();
        addLog(`Migrated ${MOCK_SHOPS.length} shops.`);
    };

    const migrateProducts = async () => {
        addLog('Starting Products Migration...');
        const batch = writeBatch(db);
        MOCK_PRODUCTS.forEach(product => {
            const ref = doc(db, 'products', String(product.id));
            batch.set(ref, product);
        });
        await batch.commit();
        addLog(`Migrated ${MOCK_PRODUCTS.length} products.`);
    };

    const migrateRepairPrices = async () => {
        addLog('Starting Repair Prices Migration...');
        const chunks = [];
        for (let i = 0; i < MOCK_REPAIR_PRICES.length; i += 400) {
            chunks.push(MOCK_REPAIR_PRICES.slice(i, i + 400));
        }

        for (const chunk of chunks) {
            const batch = writeBatch(db);
            chunk.forEach(price => {
                const ref = doc(db, 'repair_prices', String(price.id));
                batch.set(ref, price);
            });
            await batch.commit();
        }
        addLog(`Migrated ${MOCK_REPAIR_PRICES.length} repair prices.`);
    };

    const migrateBlogPosts = async () => {
        addLog('Starting Blog Posts Migration...');
        const batch = writeBatch(db);
        MOCK_BLOG_POSTS.forEach(post => {
            const ref = doc(db, 'blog_posts', String(post.id));
            batch.set(ref, post);
        });
        await batch.commit();
        addLog(`Migrated ${MOCK_BLOG_POSTS.length} blog posts.`);
    };

    const migrateServices = async () => {
        addLog('Starting Services Migration...');
        const batch = writeBatch(db);
        MOCK_SERVICES.forEach(service => {
            const ref = doc(db, 'services', String(service.id));
            batch.set(ref, service);
        });
        await batch.commit();
        addLog(`Migrated ${MOCK_SERVICES.length} services.`);
    };

    const migrateFAQs = async () => {
        addLog('Starting FAQs Migration...');
        const batch = writeBatch(db);
        MOCK_FAQ_CATEGORIES.forEach(cat => {
            const ref = doc(db, 'faq_categories', String(cat.id));
            batch.set(ref, cat);
        });
        await batch.commit();
        addLog(`Migrated ${MOCK_FAQ_CATEGORIES.length} FAQ categories.`);
    };

    const runAll = async () => {
        setStatus('Running...');
        try {
            await migrateShops();
            await migrateProducts();
            await migrateRepairPrices();
            await migrateBlogPosts();
            await migrateServices();
            await migrateFAQs();
            setStatus('Completed');
            addLog('All migrations completed successfully!');
        } catch (error: any) {
            console.error(error);
            setStatus('Error');
            addLog(`Error: ${error.message}`);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Data Migration to Firebase</h1>

            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                    Warning: This will overwrite existing data in the Firestore collections:
                    shops, products, repair_prices, blog_posts, services, faq_categories.
                </p>
            </div>

            <button
                onClick={runAll}
                disabled={status === 'Running'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
            >
                {status === 'Running' ? 'Migrating...' : 'Start Migration'}
            </button>

            <div className="mt-8 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
                {logs.length === 0 ? 'Ready to start...' : logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </div>
        </div>
    );
}
