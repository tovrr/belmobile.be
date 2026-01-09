
import { Shop } from '../types';
import { slugToDisplayName } from './slugs';

interface TextHelperProps {
    lang: 'fr' | 'nl' | 'en' | 'tr';
    shop?: Shop;
    locationName: string;
    deviceName: string;
    brand?: string;
    isHub?: boolean;
    isRepair?: boolean;
    isStore?: boolean;
    issuesText?: string;
    durationText?: string;
}

export const getSEOTitle = ({ isStore, isRepair, lang, locationName, deviceName, durationText }: Partial<TextHelperProps>) => {
    if (isStore) {
        if (lang === 'fr') return `Réparation & Rachat GSM à ${locationName} - Belmobile`;
        if (lang === 'nl') return `Smartphone Reparatie & Inkoop in ${locationName}`;
        if (lang === 'tr') return `${locationName}'de Telefon Tamiri ve Alım Satım`;
        return `Phone Repair & Buyback Store in ${locationName}`;
    }
    if (isRepair) {
        // High Intent: Repair + Device + Location + Benefit (Speed/Warranty)
        if (lang === 'fr') return `Réparation ${deviceName} à ${locationName} - ${durationText || '30 min'} & Garantie`;
        if (lang === 'nl') return `Reparatie ${deviceName} in ${locationName} - Klaar in ${durationText || '30 min'}`;
        if (lang === 'tr') return `${locationName}'de ${deviceName} Tamiri - ${durationText || '30 Dakikada'} Teslim`;
        return `Repair ${deviceName} in ${locationName} - ${durationText || '30 min'} Express`;
    }
    // Buyback Intent: Sell + Device + Location + Benefit (Cash/Price)
    if (lang === 'fr') return `Rachat ${deviceName} à ${locationName} - Paiement Cash Immédiat`;
    if (lang === 'nl') return `${deviceName} Verkopen in ${locationName} - Direct Contant Geld`;
    if (lang === 'tr') return `${locationName}'de ${deviceName} Nakit Alım - Anında Ödeme`;
    return `Sell ${deviceName} in ${locationName} - Instant Cash Payment`;
};

export const getSEODescription = ({ isStore, isRepair, lang, locationName, deviceName, isHub, shop, brand, issuesText, durationText }: TextHelperProps) => {
    // 1. Store/Hub Context - The "Institution" Pitch
    if (isStore) {
        if (lang === 'fr') {
            return `Belmobile ${locationName} : Le N°1 de la réparation et du rachat GSM à Bruxelles. Service Express 30 min pour particuliers et entreprises (B2B). Facture TVA, Garantie 1 an et protection des données certifiée.`;
        }
        if (lang === 'nl') {
            return `Belmobile ${locationName}: Dé nr.1 in smartphone reparatie en inkoop in Brussel. 30 min service voor particulieren en bedrijven (B2B). BTW-factuur, 1 jaar garantie en gecertificeerde data-privacy.`;
        }
        if (lang === 'tr') {
            return `Belmobile ${locationName}: Brüksel'in 1 numaralı telefon tamiri ve alım satım uzmanı. Bireysel ve kurumsal (B2B) için 30 dakikada ekspres servis. KDV faturası, 1 yıl garanti ve sertifikalı veri gizliliği.`;
        }
        // Fallback EN
        return `Belmobile ${locationName}: The #1 rated phone repair & buyback specialist in Brussels. 30 min express service for B2C & B2B. VAT Invoice, 1-year warranty, and certified data privacy.`;
    }

    // 2. Repair Context - The "Expert" Pitch
    if (isRepair) {
        if (lang === 'fr') {
            return `Réparation ${deviceName} certifiée à ${locationName}. ${issuesText || 'Écran, batterie, micro-soudure'} : nos experts réparent votre ${brand || 'appareil'} en ${durationText || '30 min'} chrono. Pièces Premium, Garantie 1 an & Facture pour Pros.`;
        }
        if (lang === 'nl') {
            return `Gecertificeerde ${deviceName} reparatie in ${locationName}. ${issuesText || 'Scherm, batterij of moederbord'}? Onze experts herstellen uw ${brand || 'toestel'} in ${durationText || '30 min'}. Premium onderdelen, 1 jaar garantie & Factuur.`;
        }
        if (lang === 'tr') {
            return `${locationName}'de sertifikalı ${deviceName} onarımı. ${issuesText || 'Ekran, batarya veya anakart'} sorunu mu var? Uzmanlarımız ${brand || 'cihazınızı'} ${durationText || '30 dakikada'} tamir eder. Premium parçalar, 1 yıl garanti ve kurumsal fatura.`;
        }
        return `Certified ${deviceName} repair in ${locationName}. ${issuesText || 'Screen, battery, or microsoldering'}: our experts fix your ${brand || 'device'} in ${durationText || '30 min'}. Premium Parts, 1-Year Warranty & User/Business Invoice.`;
    }

    // 3. Buyback Context - The "Best Value" Pitch
    if (lang === 'fr') return `Vendez votre ${deviceName} au prix fort à ${locationName}. Estimation IA immédiate et paiement Cash/Instant. Effacement des données certifié (GDPR) pour votre tranquillité. Leader du rachat à Bruxelles.`;
    if (lang === 'nl') return `Verkoop uw ${deviceName} voor de beste prijs in ${locationName}. Directe AI-schatting en contante betaling. Gecertificeerde dataverwijdering (GDPR). Marktleider in Brussel.`;
    if (lang === 'tr') return `${deviceName} cihazınızı ${locationName}'de en iyi fiyata satın. Anında yapay zeka fiyat tahmini ve nakit ödeme. Huzurunuz için sertifikalı veri silme (GDPR). Brüksel'in geri alım lideri.`;

    return `Sell your ${deviceName} for the highest price in ${locationName}. Instant AI quote and Cash payment. Certified Data Wipe (GDPR) for your peace of mind. Brussels' buyback leader.`;
};

export const getDeviceContext = (modelName: string, lang: 'fr' | 'nl' | 'en' | 'tr') => {
    const isHomeConsole = modelName.toLowerCase().includes('playstation') ||
        modelName.toLowerCase().includes('xbox') ||
        modelName.toLowerCase().includes('ps5') ||
        modelName.toLowerCase().includes('ps4');

    const durationText = isHomeConsole
        ? (lang === 'fr' ? '3h à 4h' : (lang === 'nl' ? '3u tot 4u' : (lang === 'tr' ? '3-4 saat' : '3-4h')))
        : (lang === 'fr' ? '30 min' : (lang === 'nl' ? '30 min' : (lang === 'tr' ? '30 dk' : '30 min')));

    const issuesText = isHomeConsole
        ? (lang === 'fr' ? 'HDMI ou surchauffe' : (lang === 'nl' ? 'HDMI of oververhitting' : (lang === 'tr' ? 'HDMI veya aşırı ısınma' : 'HDMI or overheating')))
        : (lang === 'fr' ? 'écran ou batterie' : (lang === 'nl' ? 'scherm of batterij' : (lang === 'tr' ? 'ekran veya batarya' : 'screen or battery')));

    return { isHomeConsole, durationText, issuesText, deviceType: isHomeConsole ? 'console_home' : 'smartphone' };
};
