'use server';

import { headers } from 'next/headers';

import { adminDb } from '../../lib/firebase-admin';
import { WizardState } from '../../context/WizardContext';
import { serverEmailService } from '../../services/server/emailService';
import { getMagicLinkEmail } from '../../utils/emailTemplates';
import crypto from 'crypto';

interface SaveQuoteResponse {
    success: boolean;
    quoteId?: string;
    error?: string;
}

export async function saveQuote(
    email: string,
    state: Partial<WizardState>,
    lang: 'en' | 'fr' | 'nl' | 'tr' = 'en',
    type?: 'buyback' | 'repair'
): Promise<SaveQuoteResponse> {
    try {
        if (!email || !email.includes('@')) {
            return { success: false, error: 'Invalid email address' };
        }

        const quoteId = crypto.randomUUID();

        // Determine type if not passed (fallback logic)
        // If state has 'repairIssues' that isn't empty, it's repair. 
        // If state has 'storage', it's likely buyback (or smartphone repair). 
        // Current logic was: state.deviceType === 'smartphone' ? 'buyback' : 'repair' -> This was FLAWED (Smartphones are repaired too!)
        // Better fallback logic:
        const inferredType = type || (state.repairIssues && state.repairIssues.length > 0 ? 'repair' : 'buyback');

        // Clean state to remove unnecessary UI flags or heavy data
        const cleanState = {
            ...state,
            modelsData: {}, // Don't save static data
            specsData: {},
            pricingData: {
                ...state.pricingData,
                isLoading: false
            },
            isTransitioning: false,
            isLoadingData: false,
            idFile: null // Don't save files in JSON
        };

        const leadData = {
            id: quoteId,
            email,
            state: cleanState,
            createdAt: new Date().toISOString(),
            status: 'saved', // vs 'submitted'
            type: inferredType,
            device: `${state.selectedBrand} ${state.selectedModel}`,
            estimatedPrice: state.currentEstimate
        };

        // Save to Firestore
        await adminDb.collection('quotes').doc(quoteId).set(leadData);

        // Send Magic Link Email
        try {
            // Determine Base URL (Localhost vs Prod support)
            const headersList = await headers();
            const host = headersList.get('host') || 'belmobile.be';
            const protocol = headersList.get('x-forwarded-proto') || 'https';
            const baseUrl = `${protocol}://${host}`;

            const magicLink = `${baseUrl}/${lang}/resume/${quoteId}`;
            const deviceName = `${state.selectedBrand} ${state.selectedModel}`;
            const emailData = getMagicLinkEmail(email, magicLink, lang, deviceName, inferredType, quoteId);

            await serverEmailService.sendEmail(email, emailData.subject, emailData.html);
            console.log(`[SaveQuote] Email sent to ${email}`);
        } catch (emailError) {
            console.error('[SaveQuote] Failed to send email:', emailError);
            // We don't fail the request if email fails, but we log it. 
            // The user still got the UI confirmation that it was saved (which is technically true).
        }

        console.log(`[SaveQuote] Saved quote ${quoteId} for ${email}`);

        return { success: true, quoteId };

    } catch (error) {
        console.error('[SaveQuote] Error:', error);
        return { success: false, error: 'Failed to save quote' };
    }
}
