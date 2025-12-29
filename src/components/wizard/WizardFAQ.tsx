'use client';

import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { slugToDisplayName } from '../../utils/slugs';
import { QuestionMarkCircleIcon, PhoneIcon, ChatBubbleLeftRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface ContactButtonProps {
    icon: React.ElementType;
    title: string;
    value: string;
    href: string;
    color: string;
    onClick?: (e: React.MouseEvent) => void;
}

const ContactButton: React.FC<ContactButtonProps> = ({ icon: Icon, title, value, href, color, onClick }) => {
    const { t } = useLanguage();
    return (
        <a
            href={href}
            onClick={onClick}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group h-full"
        >
            <div className={`p-2.5 rounded-xl ${color} text-white mb-2 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider text-center mb-0.5 leading-tight">{t(title)}</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white text-center leading-tight">{value}</p>
        </a>
    );
};

export const WizardFAQ: React.FC<{
    currentStep?: number;
    flow?: 'buyback' | 'repair';
    deviceType?: string;
    selectedBrand?: string;
    selectedModel?: string;
}> = ({ flow, deviceType, selectedBrand, selectedModel }) => {
    const { t } = useLanguage();

    // Construct WhatsApp Message
    const getWhatsAppMessage = () => {
        if (selectedBrand && selectedModel && flow) {
            const template = flow === 'buyback' ? 'whatsapp_msg_buyback' : 'whatsapp_msg_repair';
            // We need to fetch the translated template and replace placeholders
            // Since `t` usually just returns the string, we might need a helper or manual replace if `t` doesn't support interpolation directly in this project's setup.
            // Assuming `t` returns the raw string if no interpolation support or checking if we need to do manual replace.
            // Based on earlier usage i.e., {0}, likely manual replace or formatted.
            // Let's assume manual replacement for safety if `t` signature isn't known to be smart.
            let msg = t(template) || '';
            const brand = selectedBrand || '';
            const model = selectedModel ? (slugToDisplayName ? slugToDisplayName(selectedModel) : selectedModel) : '';

            // Replace {0} with Brand, {1} with Model
            msg = msg.replace('{0}', brand).replace('{1}', model);
            return msg;
        }
        return t('whatsapp_msg_general');
    };

    const buttons = [
        {
            icon: PhoneIcon,
            title: 'support_call_label',
            value: '+32 2 275 98 67',
            href: 'tel:+3222759867',
            color: 'bg-blue-500'
        },
        {
            icon: ChatBubbleLeftRightIcon,
            title: 'support_whatsapp_label',
            value: 'WhatsApp',
            href: `https://wa.me/32484837560?text=${encodeURIComponent(getWhatsAppMessage())}`,
            color: 'bg-green-500'
        },
        {
            icon: SparklesIcon,
            title: 'support_chat_label',
            value: 'AI Assistant',
            href: '#chat',
            color: 'bg-purple-500',
            onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('open-ai-chat'));
            }
        }
    ];

    return (
        <div className="mt-8 space-y-4 animate-fade-in border-t border-gray-100 dark:border-slate-800 pt-8">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                <QuestionMarkCircleIcon className="h-4 w-4 text-bel-blue" />
                {t('need_help_title')}
            </h4>

            <div className="grid grid-cols-3 gap-3">
                {buttons.map((btn, idx) => (
                    <ContactButton key={idx} {...btn} />
                ))}
            </div>
        </div>
    );
};
