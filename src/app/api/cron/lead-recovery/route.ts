import { NextResponse } from 'next/server';
import { leadRecoveryService } from '@/services/server/leadRecoveryService';
import { logger } from '@/utils/logger';

/**
 * CRON TRIGGER FOR LEAD RECOVERY
 * Can be called by Vercel Cron or GitHub Actions.
 * Requirement: Leads > €300, 30m-24h abandonment.
 */
export async function GET(request: Request) {
    try {
        // 1. Security Check (Basic token or header)
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        logger.info('[Cron] Starting Lead Recovery scan...');

        // 2. Get nudgeable leads
        const leads = await leadRecoveryService.getNudgeableLeads();

        if (leads.length === 0) {
            return NextResponse.json({ success: true, message: 'No abandoned leads found to nudge.' });
        }

        logger.info(`[Cron] Found ${leads.length} leads to nudge.`);

        // 3. Dispatch nudges
        const results = await Promise.allSettled(
            leads.map(lead => leadRecoveryService.sendWhatsAppNudge(lead))
        );

        const succeeded = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
        const failed = leads.length - succeeded;

        logger.info(`[Cron] Lead Recovery complete. Succeeded: ${succeeded}, Failed: ${failed}`);

        return NextResponse.json({
            success: true,
            processed: leads.length,
            succeeded,
            failed
        });

    } catch (error: any) {
        logger.error('[Cron] Lead Recovery failed:', error);
        return NextResponse.json({ error: 'Internal Error', details: error.message }, { status: 500 });
    }
}
