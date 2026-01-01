
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

export const getSEOTitle = ({ isStore, isRepair, lang, locationName, deviceName }: Partial<TextHelperProps>) => {
    if (isStore) {
        if (lang === 'fr') return `Services de réparation et rachat à ${locationName}`;
        if (lang === 'nl') return `Reparatie- en inkoopdiensten in ${locationName}`;
        if (lang === 'tr') return `${locationName}'de Onarım ve Geri Alım Hizmetleri`;
        return `Repair and Buyback Services in ${locationName}`;
    }
    if (isRepair) {
        if (lang === 'fr') return `Options de réparation pour votre ${deviceName} à ${locationName}`;
        if (lang === 'nl') return `Reparatieopties voor uw ${deviceName} in ${locationName}`;
        if (lang === 'tr') return `${locationName}'de ${deviceName} Onarım Seçenekleri`;
        return `Repair Options for your ${deviceName} in ${locationName}`;
    }
    if (lang === 'fr') return `Estimation de rachat pour votre ${deviceName} à ${locationName}`;
    if (lang === 'nl') return `Waardebepaling voor uw ${deviceName} in ${locationName}`;
    if (lang === 'tr') return `${locationName}'de ${deviceName} Geri Alım Fiyatı`;
    return `Buyback Estimate for your ${deviceName} in ${locationName}`;
};

export const getSEODescription = ({ isStore, isRepair, lang, locationName, deviceName, isHub, shop, brand, issuesText, durationText }: TextHelperProps) => {
    if (isStore) {
        if (lang === 'fr') {
            if (isHub) return `Besoin d'une réparation smartphone à Bruxelles ? Belmobile est votre expert local pour la réparation express (écran, batterie) et le rachat cash. Retrouvez nos techniciens à Schaerbeek (1030), Molenbeek-Saint-Jean (1080) et Anderlecht (1070). Service 30 min sans RDV.`;
            if (locationName.includes('Schaerbeek')) return `Besoin d'une réparation smartphone à Schaerbeek (1030) ? Situé Chaussée de Haecht, Belmobile est votre expert local. Écran cassé, batterie à plat ? Réparation en 30 min sans rendez-vous.`;
            if (locationName.includes('Molenbeek')) return `Besoin d'une réparation smartphone à Molenbeek-Saint-Jean (1080) ? Notre boutique de Tour & Taxis est temporairement fermée, mais pas d'inquiétude ! Notre centre principal de Schaerbeek (Liedts) est à 5 min. Plus de techniciens, plus de stock, réparation en 30 min garantie. On vous offre même le taxi/Uber !`;
            if (locationName.includes('Anderlecht')) return `Expert réparation GSM à Anderlecht (1070), Chaussée de Mons. Belmobile répare votre téléphone ou tablette en un temps record. Pièces d'origine et devis gratuit.`;

            const shopName = shop?.name || 'Belmobile';
            const displayShopName = shopName.includes(locationName) ? 'Belmobile' : shopName;
            return `Bienvenue chez ${displayShopName}, votre expert local à ${locationName}. Situé au ${shop?.address}, nous offrons des services rapides pour smartphones, tablettes et consoles.`;
        }
        if (lang === 'nl') {
            if (isHub) return `Smartphone reparatie in Brussel nodig? Belmobile is uw vertrouwde partner voor snelle reparaties (scherm, batterij) en inkoop in heel Brussel. Bezoek onze experts in Schaerbeek, Molenbeek en Anderlecht voor 30 min service zonder afspraak.`;
            const shopName = shop?.name || 'Belmobile';
            const displayShopName = shopName.includes(locationName) ? 'Belmobile' : shopName;
            return `Welkom bij ${displayShopName}, uw lokale expert in ${locationName}. Gevestigd aan ${shop?.address}, bieden wij snelle diensten voor smartphones, tablets en consoles.`;
        }
        if (lang === 'tr') {
            if (isHub) return `Brüksel'de akıllı telefon onarımı mı lazım? Belmobile, Brüksel genelinde ekspres onarım (ekran, batarya) ve geri alım uzmanınızdır. Schaerbeek, Molenbeek ve Anderlecht'teki uzmanlarımızı randevusuz ziyaret edin, 30 dakikada hizmet alın.`;
            const shopName = shop?.name || 'Belmobile';
            const displayShopName = shopName.includes(locationName) ? 'Belmobile' : shopName;
            return `${locationName}'deki uzmanınız ${displayShopName}'e hoş geldiniz. ${shop?.address} adresindeki mağazamızda akıllı telefon, tablet ve konsollar için hızlı servis sunuyoruz.`;
        }
        // Default EN
        if (isHub) return `Need a smartphone repair in Brussels? Belmobile is your trusted partner for express repair (screen, battery) and buyback across Brussels. Visit our experts in Schaerbeek, Molenbeek, and Anderlecht for 30 min service without appointment.`;
        const shopName = shop?.name || 'Belmobile';
        const displayShopName = shopName.includes(locationName) ? 'Belmobile' : shopName;
        return `Welcome to ${displayShopName}, your local expert in ${locationName}. Located at ${shop?.address}, we offer fast services for smartphones, tablettes and consoles.`;
    }

    if (isRepair) {
        if (lang === 'fr') {
            if (locationName.includes('Schaerbeek')) return `Réparation ${deviceName} à Schaerbeek (1030). Nos techniciens chaussée de Haecht remplacent votre écran ou batterie en 30 minutes. Garantie 1 an et pièces premium.`;
            if (locationName.includes('Molenbeek')) return `Réparation ${deviceName} à Molenbeek (Fermé temp.). Redirection vers notre centre principal Schaerbeek (Liedts). Service express, stock géant et prise en charge immédiate.`;
            if (locationName.includes('Anderlecht')) return `Centre de réparation ${deviceName} à Anderlecht. Retrouvez Belmobile chaussée de Mons pour un service rapide et fiable. Microsoudure et récupération de données disponibles.`;
            return `Vous cherchez une réparation rapide pour votre ${deviceName} à ${locationName} ? Chez Belmobile, nos techniciens certifiés sont experts ${brand ? `en appareils ${brand}` : 'toutes marques'}. Nous réparons votre ${issuesText} en ${durationText} avec des pièces de qualité.`;
        }
        if (lang === 'nl') {
            return `Zoekt u een snelle reparatie voor uw ${deviceName} in ${locationName}? Bij Belmobile zijn onze gecertificeerde technici experts in ${brand || 'alle merken'}. Wij repareren uw ${issuesText} in ${durationText} met kwaliteitsonderdelen.`;
        }
        if (lang === 'tr') {
            return `${locationName}'de ${deviceName} için hızlı onarım mı arıyorsunuz? Belmobile'de sertifikalı teknisyenlerimiz ${brand ? `${brand} cihazları` : 'tüm markalar'} konusunda uzmandır. ${deviceName} cihazınızın ${issuesText} sorununu ${durationText} içinde kaliteli parçalarla onarıyoruz.`;
        }
        return `Looking for a fast repair for your ${deviceName} in ${locationName}? At Belmobile, our certified technicians are experts in ${brand || 'all brands'} devices. We fix your ${issuesText} in ${durationText} using quality parts.`;
    }

    // Buyback (default)
    if (lang === 'fr') return `Vendez votre ${deviceName} au meilleur prix à ${locationName}. Belmobile rachète votre appareil cash ou par virement instantané. Estimation gratuite même si cassé.`;
    if (lang === 'nl') return `Wilt u uw ${deviceName} verkopen in ${locationName}? Belmobile biedt u het beste overnamebod, direct betaald in contanten. Laat uw oude apparaat geen stof verzamelen.`;
    if (lang === 'tr') return `${deviceName} cihazınızı ${locationName}'de en iyi fiyata satın. Belmobile cihazınızı anında nakit veya havale ile alır. Kırık olsa bile ücretsiz fiyat teklifi alın.`;
    return `Do you want to sell your ${deviceName} in ${locationName}? Belmobile offers you the best trade-in deal, paid immediately in cash. Don't let your old device gather dust.`;
};
