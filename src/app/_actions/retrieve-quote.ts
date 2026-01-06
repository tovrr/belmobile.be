'use server';

import { adminDb } from '@/lib/firebase-admin';
import * as Sentry from '@sentry/nextjs';
import { WizardState } from '@/context/WizardContext';

export interface RetrieveQuoteResponse {
    success: boolean;
    data?: Partial<WizardState>;
    error?: string;
    type?: 'repair' | 'buyback';
}

export async function retrieveQuote(id: string): Promise<RetrieveQuoteResponse> {
    try {
        if (!id) return { success: false, error: 'Missing Quote ID' };

        const doc = await adminDb.collection('quotes').doc(id).get();

        if (!doc.exists) {
            return { success: false, error: 'Quote not found' };
        }

        const data = doc.data();

        // Convert Firestore data back to WizardState
        // Note: Firestore timestamps might need conversion if we stored dates, but WizardState uses strings mostly.
        // Also check if 'state' field exists or if data is the state.
        // Looking at save-quote.ts, we save { ...state, ...metadata }.
        // So the document fields are the state fields.

        const state: Partial<WizardState> = {
            ...data as any
        };

        // Determine type from state
        // If repairIssues is present and non-empty, likely repair. 
        // Or check if we saved a 'type' field?
        // save-quote.ts saves:
        // const quoteData = { ...state, id: quoteId, ...timestamps, status: ... }
        // It doesn't explicitly save 'type' unless it was in 'state'.

        let type: 'repair' | 'buyback' = 'repair'; // default

        // Logical deduction of type based on data presence
        if (state.storage && !state.repairIssues?.length) {
            type = 'buyback';
        } else if (state.repairIssues?.length) {
            type = 'repair';
        }

        return {
            success: true,
            data: state,
            type
        };

    } catch (error) {
        console.error('[RetrieveQuote] Error:', error);
        Sentry.captureException(error, { tags: { action: 'retrieveQuote', id } });
        return { success: false, error: 'Internal Server Error' };
    }
}
