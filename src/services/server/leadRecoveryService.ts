import { adminDb } from '../../lib/firebase-admin';
import { logger } from '../../utils/logger';

/**
 * LEAD RECOVERY SERVICE
 * Handles identifying and nudging abandoned sessions.
 */
export const leadRecoveryService = {
    /**
     * Finds high-value leads (> €300) that haven't converted
     * and haven't been nudged yet.
     */
    async getNudgeableLeads(thresholdPrice = 300, minAgeMinutes = 30, maxAgeHours = 24) {
        try {
            const now = new Date();
            const minAgeDate = new Date(now.getTime() - minAgeMinutes * 60 * 1000);
            const maxAgeDate = new Date(now.getTime() - maxAgeHours * 60 * 1000);

            // Fetch leads updated between maxAge and minAge
            const snapshot = await adminDb.collection('leads')
                .where('isConverted', '==', false)
                .where('status', '==', 'draft')
                .where('updatedAt', '<=', minAgeDate)
                .where('updatedAt', '>=', maxAgeDate)
                .get();

            if (snapshot.empty) {
                return [];
            }

            const leads = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter by price (currentEstimate is in wizardState)
            const highValueLeads = leads.filter((lead: any) => {
                const estimate = lead.wizardState?.currentEstimate || 0;
                const alreadyNudged = lead.whatsappNudgeSent === true;
                return estimate >= thresholdPrice && !alreadyNudged;
            });

            return highValueLeads;
        } catch (error) {
            logger.error('[LeadRecovery] Error fetching nudgeable leads:', error as any);
            return [];
        }
    },

    /**
     * Dispatches a WhatsApp nudge for a specific lead.
     */
    async sendWhatsAppNudge(lead: any) {
        const to = lead.phone || lead.wizardState?.customerPhone;
        const name = lead.name || lead.wizardState?.customerName || 'Client';
        const model = lead.model || lead.wizardState?.selectedModel || 'votre appareil';
        const price = lead.wizardState?.currentEstimate || 0;
        const lang = lead.lang || lead.wizardState?.language || 'fr';

        // Generate recovery link
        const recoveryUrl = `https://belmobile.be/${lang}/resume?token=${lead.magicLinkToken}`;

        if (!to) {
            logger.warn(`[LeadRecovery] No phone number for lead ${lead.id}`);
            return false;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications/whatsapp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to,
                    template: 'lead_recovery_v1',
                    languageCode: lang === 'nl' ? 'nl' : 'fr',
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                { type: 'text', text: name },
                                { type: 'text', text: model },
                                { type: 'text', text: price.toString() },
                                { type: 'text', text: recoveryUrl }
                            ]
                        }
                    ],
                    orderId: `NUDGE-${lead.id.substring(0, 8)}`
                })
            });

            const result = await response.json();

            if (result.success) {
                // Mark as nudged
                await adminDb.collection('leads').doc(lead.id).update({
                    whatsappNudgeSent: true,
                    whatsappNudgeAt: new Date().toISOString()
                });
                logger.info(`[LeadRecovery] Nudge sent successfully to ${to} for lead ${lead.id}`);
                return true;
            } else {
                logger.error(`[LeadRecovery] WhatsApp API failed for lead ${lead.id}:`, result);
                return false;
            }
        } catch (error) {
            logger.error(`[LeadRecovery] Error dispatching nudge for lead ${lead.id}:`, error as any);
            return false;
        }
    }
};
