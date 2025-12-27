import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Shop } from '../types';
import { SHOPS } from '../constants';

export async function getShops(): Promise<Shop[]> {
    try {
        const snapshot = await getDocs(collection(db, 'shops'));
        const data = snapshot.docs.map(doc => {
            const shopData = { id: doc.id, ...doc.data() } as Shop;

            // Override with verified constants for core shops to prevent map errors
            const verifiedShop = SHOPS.find(s => s.id === shopData.id);
            if (verifiedShop && (shopData.id === 'schaerbeek' || shopData.id === 'anderlecht' || shopData.id === 'molenbeek')) {
                return {
                    ...shopData,
                    coords: verifiedShop.coords,
                    address: verifiedShop.address,
                    name: verifiedShop.name,
                    status: verifiedShop.status
                };
            }
            return shopData;
        });

        // Priority Sort: Liedts (schaerbeek) > Bara (anderlecht) > Tour & Taxis (molenbeek)
        const priorityIds = ['schaerbeek', 'anderlecht', 'molenbeek'];

        const sortedData = [...data].sort((a, b) => {
            const aIdx = priorityIds.indexOf(a.id as string);
            const bIdx = priorityIds.indexOf(b.id as string);

            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
            if (aIdx !== -1) return -1;
            if (bIdx !== -1) return 1;

            const aIsComing = a.status === 'coming_soon';
            const bIsComing = b.status === 'coming_soon';
            if (!aIsComing && bIsComing) return -1;
            if (aIsComing && !bIsComing) return 1;

            return (a.name || '').localeCompare(b.name || '');
        });

        return sortedData;
    } catch (error) {
        console.error("Error fetching shops for ISR:", error);
        return SHOPS as Shop[]; // Fallback to constants
    }
}
