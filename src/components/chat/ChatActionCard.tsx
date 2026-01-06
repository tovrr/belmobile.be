'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBagIcon, MapPinIcon, ArrowRightIcon, TruckIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../hooks/useLanguage';

interface ChatActionCardProps {
    type: 'product' | 'shop' | 'whatsapp' | 'order';
    data: {
        id?: string;
        name?: string;
        price?: number;
        image?: string;
        address?: string;
        city?: string;
        path?: string;
        message?: string;
        status?: string;
        phoneNumber?: string;
    };
    onAction?: () => void;
}

const ChatActionCard: React.FC<ChatActionCardProps> = ({ type, data, onAction }) => {
    const { t } = useLanguage();

    // 1. PRODUCT CARD
    if (type === 'product' && data.name) {
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

    // 2. ORDER TRACKING CARD (New Design)
    if (type === 'order') {
        const isCompleted = data.status === 'Completed' || data.status === 'Repaired';
        return (
            <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-4 my-2 group transition-all hover:shadow-indigo-500/20 relative overflow-hidden ring-1 ring-white/10">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>

                <div className="flex items-start gap-3 relative z-10">
                    <div className={`p-2.5 rounded-xl backdrop-blur-md ring-1 ring-white/20 ${isCompleted ? 'bg-green-500/20' : 'bg-indigo-500/20'}`}>
                        {isCompleted ? (
                            <CheckBadgeIcon className="w-6 h-6 text-green-400" />
                        ) : (
                            <TruckIcon className="w-6 h-6 text-indigo-400" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm text-white truncate pr-2">{data.name || t('order_tracking')}</h4>
                            {data.status && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${isCompleted ? 'border-green-500/30 text-green-400' : 'border-indigo-400/30 text-indigo-300'}`}>
                                    {data.status}
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {data.message || t('click_to_view_your_order_status')}
                        </p>
                    </div>
                </div>

                <Link
                    href={data.path || '#'}
                    onClick={onAction}
                    className="flex items-center justify-center gap-2 w-full mt-4 py-2.5 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98]"
                >
                    <span>{t('view_live_status')}</span>
                    <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        );
    }


    // 3. WHATSAPP CARD
    if (type === 'whatsapp') {
        const phoneNumber = data.phoneNumber || '32484837560';
        const message = data.message || t('chat_default_whatsapp_message');
        const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;

        return (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800 shadow-sm p-4 my-2 group transition-all hover:shadow-md">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-full text-white shadow-lg shadow-green-500/30 animate-pulse">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{t('chat_continued_support')}</h4>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">{t('chat_move_to_whatsapp')}</p>
                        </div>
                    </div>
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onAction}
                        className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xs text-center transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                        <span>{t('chat_continue_on_whatsapp')}</span>
                        <ArrowRightIcon className="w-3 h-3" />
                    </a>
                </div>
            </div>
        );
    }

    // 4. DEFAULT: SHOP / LOCATION CARD
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
