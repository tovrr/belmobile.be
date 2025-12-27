import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';

export async function getProducts(): Promise<Product[]> {
    try {
        const snapshot = await getDocs(collection(db, 'products'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching products for ISR:", error);
        return [];
    }
}
