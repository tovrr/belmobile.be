type GTagEvent = {
    action: string;
    category: string;
    label: string;
    value?: number;
};

export const sendGAEvent = ({ action, category, label, value }: GTagEvent) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};

export const trackViewItem = (product: { id: string | number; name: string; price?: number }) => {
    sendGAEvent({
        action: "view_item",
        category: "Commerce",
        label: product.name,
        value: product.price,
    });
};

export const trackReservationStart = (product: { id: string | number; name: string }) => {
    sendGAEvent({
        action: "begin_checkout",
        category: "Commerce",
        label: product.name,
    });
};

export const trackReservationComplete = (product: { id: string | number; name: string; price?: number }, method: string) => {
    sendGAEvent({
        action: "purchase",
        category: "Commerce",
        label: `${product.name} (${method})`,
        value: product.price,
    });
};

export const trackRepairRequest = (device: string, issue: string, price: number) => {
    sendGAEvent({
        action: "generate_lead",
        category: "Repair",
        label: `${device} - ${issue}`,
        value: price,
    });
};

export const trackBuybackRequest = (device: string, condition: string, price: number) => {
    sendGAEvent({
        action: "generate_lead",
        category: "Buyback",
        label: `${device} - ${condition}`,
        value: price,
    });
};
