export interface TemplateConfig {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    theme: 'aegis' | 'apollo';
    prefixes: {
        order: string;
        invoice: string;
    };
    legal: {
        repairTerms: string;
        buybackTerms: string;
        b2bTerms: string;
        showOnSecondPage: boolean;
    };
}

export type EmailType = 'quote_status' | 'payment_received' | 'reservation_status' | 'review_request';
export type Lang = 'en' | 'fr' | 'nl';

export interface EmailTemplate {
    subject: string;
    content: string;
}

export type EmailTemplatesConfig = Record<EmailType, Record<Lang, EmailTemplate>>;
