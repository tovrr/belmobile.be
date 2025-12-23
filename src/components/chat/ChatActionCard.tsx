'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBagIcon, MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../hooks/useLanguage';

interface ChatActionCardProps {
    type: 'product' | 'shop';
    data: {
        id: string;
        name: string;
        price?: number;
        image?: string;
        address?: string;
        city?: string;
        path?: string;
    };
    onAction?: () => void;
}

const ChatActionCard: React.FC<ChatActionCardProps> = ({ type, data, onAction }) => {
    const { t } = useLanguage();

    if (type === 'product') {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden my-2 flex flex-col group transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900">
                <div className="relative h-32 w-full bg-slate-50 dark:bg-slate-900/50">
                    {data.image ? (
                        <Image
                            src={data.image}
                            alt={data.name}
                            fill
                            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-300">
                            <ShoppingBagIcon className="w-12 h-12" />
                        </div>
                    )}
                    {data.price && (
                        <div className="absolute top-2 right-2 bg-electric-indigo text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                            €{data.price}
                        </div>
                    )}
                </div>
                <div className="p-3">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1 mb-1">{data.name}</h4>
                    <Link
                        href={data.path || '#'}
                        onClick={onAction}
                        className="flex items-center justify-between w-full mt-2 text-[11px] font-bold text-electric-indigo dark:text-indigo-400 group-hover:translate-x-1 transition-transform"
                    >
                        <span>{t('view_details')}</span>
                        <ArrowRightIcon className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-3 my-2 group transition-all hover:shadow-md">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-electric-indigo dark:text-indigo-400">
                    <MapPinIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-0.5">{data.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{data.address}, {data.city}</p>
                    <Link
                        href={data.path || '#'}
                        onClick={onAction}
                        className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-electric-indigo dark:text-indigo-400"
                    >
                        {t('get_directions')}
                        <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-all" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ChatActionCard;
