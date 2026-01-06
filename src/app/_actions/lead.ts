'use server';

import { adminDb } from '@/lib/firebase-admin';
import { WizardState } from '@/context/WizardContext';

export interface SaveLeadResponse {
    success: boolean;
    token?: string;
    error?: string;
}

export async function saveLead(email: string, state: WizardState): Promise<SaveLeadResponse> {
    if (!email || !email.includes('@')) {
        return { success: false, error: 'Invalid email address.' };
    }

    try {
        // Generate a secure, short token for the recovery link
        const token = crypto.randomUUID().split('-')[0]; // simple 8-char token

        const leadData = {
            id: token,
            email,
            // We strip potentially sensitive or large unnecessary data if needed, 
            // but for now we save the essential wizard state.
            wizardState: JSON.stringify(state),
            createdAt: new Date().toISOString(),
            status: 'captured_exit_intent',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 Days validity
            device: {
                model: state.selectedModel,
                brand: state.selectedBrand,
                type: state.deviceType
            },
            estimate: state.currentEstimate
        };

        if (adminDb) {
            await adminDb.collection('leads').doc(token).set(leadData);
        } else {
            console.warn('[MOCK MODE] Lead would be saved to Firestore:', leadData);
        }

        // TRIGGER EMAIL (Placeholder for Phase 3)
        // await sendRecoveryEmail(email, token, state.currentEstimate);

        return { success: true, token };
    } catch (error) {
        console.error('Error saving lead:', error);
        return { success: false, error: 'Failed to save quote. Please try again.' };
    }
}
