'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { orderService } from '@/services/orderService';
import { DraftLead } from '@/types';
import { createSlug } from '@/utils/slugs';

export default function RecoveryClientSideLogic({ token, lang }: { token: string; lang: string }) {
    const router = useRouter();

    useEffect(() => {
        const recoverLead = async () => {
            try {
                const leadData = await orderService.getLeadByToken(token);
                const lead = leadData as (DraftLead & { type?: string; brand?: string; model?: string });

                if (lead && lead.wizardState) {
                    // Store the recovery state in sessionStorage to be picked up by BuybackRepair
                    sessionStorage.setItem('belmobile_recovery_state', JSON.stringify(lead.wizardState));

                    // Determine where to redirect based on lead data
                    const type = lead.type || 'repair';
                    const brand = lead.brand ? createSlug(lead.brand) : '';
                    const model = lead.model ? createSlug(lead.model) : '';

                    const serviceSlug = lang === 'nl'
                        ? (type === 'buyback' ? 'verkopen' : 'reparatie')
                        : (type === 'buyback' ? 'vendre' : 'reparation');

                    let redirectPath = `/${lang}/${serviceSlug}`;
                    if (brand) redirectPath += `/${brand}`;
                    if (model) redirectPath += `/${model}`;

                    router.replace(redirectPath);
                } else {
                    console.error('Lead not found or invalid');
                    router.replace(`/${lang}`);
                }
            } catch (err) {
                console.error('Recovery error:', err);
                router.replace(`/${lang}`);
            }
        };

        recoverLead();
    }, [token, lang, router]);

    return null;
}
