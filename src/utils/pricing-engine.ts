export const PRICING_CONSTANTS = {
    // Buyback Generic
    OVERHEAD_COST: 20, // Shipping, processing (€)
    PROFIT_MARGIN_PERCENT: 0.45, // 45% Margin (so Offer is ~55% of Value)

    // Repair Generic
    PART_MARKUP: 1.10, // 10% Markup
    SERVICE_MARGIN: 30, // Profit per repair (€)
    HOURLY_LABOR_RATE: 50, // €50/hour
};

export interface BuybackDeduction {
    label: string;
    amount: number;
}

export const PricingEngine = {
    /**
     * Calculate Buyback Offer based on Resale Value
     * Formula: P_max = V_resale - C_overhead - M_profit
     * Then subtract deductions.
     */
    calculateBuybackOffer: (resaleValue: number, deductions: BuybackDeduction[] = []): number => {
        if (resaleValue <= 0) return 0;

        const profitMargin = resaleValue * PRICING_CONSTANTS.PROFIT_MARGIN_PERCENT;
        const maxOffer = resaleValue - PRICING_CONSTANTS.OVERHEAD_COST - profitMargin;

        const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
        const finalOffer = Math.max(0, Math.round(maxOffer - totalDeductions));

        return finalOffer;
    },

    /**
     * Calculate Repair Price
     * Formula: P_repair = (C_part * 1.1) + C_labor + M_service
     */
    calculateRepairPrice: (partCost: number, laborMinutes: number): number => {
        const partPrice = partCost * PRICING_CONSTANTS.PART_MARKUP;
        const laborCost = (laborMinutes / 60) * PRICING_CONSTANTS.HOURLY_LABOR_RATE;

        const totalPrice = partPrice + laborCost + PRICING_CONSTANTS.SERVICE_MARGIN;

        // Round to nearest 5 or 10 for cleaner pricing? Let's just round to integer first.
        return Math.ceil(totalPrice);
    }
};
