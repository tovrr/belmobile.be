import { OrderStatus } from '../types';

export interface StateTransition {
    from: OrderStatus;
    to: OrderStatus;
    action: string;
    requiredRole?: 'admin' | 'technician' | 'system';
}

/**
 * THE APOLLO STATE MACHINE
 * Strictly enforces the lifecycle of an order.
 */
export class OrderStateMachine {

    // validTransitions[FROM_STATE] = [ALLOWED_TO_STATES]
    private static transitions: Record<OrderStatus, OrderStatus[]> = {
        'draft': ['new', 'pending_drop', 'cancelled'],
        'new': ['pending_drop', 'received', 'cancelled'],
        'pending_drop': ['received', 'cancelled'],
        'received': ['in_diagnostic', 'cancelled', 'issue'],
        'in_diagnostic': ['verified', 'issue', 'cancelled', 'waiting_parts'],
        'waiting_parts': ['in_diagnostic', 'in_repair', 'cancelled'],

        // Verified Split
        'verified': ['payment_queued', 'invoiced', 'in_repair', 'cancelled', 'issue'],

        // Financials
        'payment_queued': ['paid', 'issue'], // Buyback
        'invoiced': ['paid', 'cancelled'],   // Repair
        'paid': ['in_repair', 'completed', 'shipped', 'payment_sent'],

        // Work
        'in_repair': ['ready', 'issue', 'waiting_parts', 'repaired'],

        // Logistics
        'ready': ['completed', 'shipped'],
        'shipped': ['completed', 'issue'],

        // Terminal / Legacy Migration Paths
        'issue': ['in_diagnostic', 'verified', 'cancelled'],
        'completed': [],
        'cancelled': [],

        // Legacy Support - Migration Paths
        'processing': ['received', 'cancelled'],
        'holding': ['ready', 'cancelled'],
        'repaired': ['ready', 'completed'],
        'responded': ['received', 'cancelled'],
        'inspected': ['verified'],
        'payment_sent': ['completed'],
        'closed': []
    };

    /**
     * Validates if a transition is allowed.
     */
    static canTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
        const allowedNext = this.transitions[currentStatus];
        return allowedNext ? allowedNext.includes(nextStatus) : false;
    }

    /**
     * Returns a human-readable label for the status (for UI).
     */
    static getLabel(status: OrderStatus, lang: 'en' | 'fr' | 'nl' = 'en'): string {
        const labels: Record<OrderStatus, { en: string; fr: string; nl: string }> = {
            'draft': { en: 'Draft', fr: 'Brouillon', nl: 'Concept' },
            'new': { en: 'New', fr: 'Nouveau', nl: 'Nieuw' },
            'pending_drop': { en: 'In Transit', fr: 'En transit', nl: 'Onderweg' },
            'received': { en: 'Received', fr: 'Reçu', nl: 'Ontvangen' },
            'in_diagnostic': { en: 'In Diagnostic', fr: 'En diagnostic', nl: 'In diagnose' },
            'waiting_parts': { en: 'Waiting for Parts', fr: 'En attente de pièces', nl: 'Wachten op onderdelen' },
            'verified': { en: 'Verified', fr: 'Vérifié', nl: 'Geverifieerd' },
            'payment_queued': { en: 'Payment Queued', fr: 'Paiement en attente', nl: 'Betaling in wachtrij' },
            'invoiced': { en: 'Invoiced', fr: 'Facturé', nl: 'Gefactureerd' },
            'paid': { en: 'Paid', fr: 'Payé', nl: 'Betaald' },
            'in_repair': { en: 'In Repair', fr: 'En réparation', nl: 'In reparatie' },
            'ready': { en: 'Ready', fr: 'Prêt (Available)', nl: 'Klaar' },
            'shipped': { en: 'Shipped', fr: 'Expédié', nl: 'Verzonden' },
            'completed': { en: 'Completed', fr: 'Terminé', nl: 'Voltooid' },
            'cancelled': { en: 'Cancelled', fr: 'Annulé', nl: 'Geannuleerd' },
            'issue': { en: 'Issue', fr: 'Problème', nl: 'Probleem' },

            // Legacy Mappings
            'processing': { en: 'Processing', fr: 'Traitement', nl: 'Verwerking' },
            'holding': { en: 'On Hold', fr: 'En attente', nl: 'In de wacht' },
            'repaired': { en: 'Repaired', fr: 'Réparé', nl: 'Gerepareerd' },
            'responded': { en: 'Responded', fr: 'Répondu', nl: 'Beantwoord' },
            'inspected': { en: 'Inspected', fr: 'Inspecté', nl: 'Geïnspecteerd' },
            'payment_sent': { en: 'Payment Sent', fr: 'Paiement Envoyé', nl: 'Betaling Verzonden' },
            'closed': { en: 'Closed', fr: 'Fermé', nl: 'Gesloten' }
        };
        return labels[status]?.[lang] || status;
    }

    /**
     * Returns progress percentage (0-100).
     */
    static getProgress(status: OrderStatus): number {
        // Normalize legacy to new flow for progress
        const progressMap: Record<OrderStatus, number> = {
            'draft': 0,
            'new': 10,
            'pending_drop': 20,
            'processing': 30, // Legacy
            'received': 40,
            'responded': 40, // Legacy
            'in_diagnostic': 50,
            'inspected': 50,  // Legacy
            'waiting_parts': 50,
            'issue': 50,
            'holding': 50,    // Legacy
            'verified': 60,
            'invoiced': 65,
            'payment_queued': 70,
            'paid': 75,
            'in_repair': 80,
            'repaired': 85,   // Legacy
            'ready': 90,
            'shipped': 95,
            'payment_sent': 95, // Legacy
            'completed': 100,
            'closed': 100,      // Legacy
            'cancelled': 0
        };
        return progressMap[status] || 0;
    }
}
