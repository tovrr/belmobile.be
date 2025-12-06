import { collection, doc, writeBatch, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
    MOCK_PRODUCTS,
    MOCK_SHOPS,
    MOCK_SERVICES,
    MOCK_RESERVATIONS,
    MOCK_QUOTES,
    MOCK_FRANCHISE_APPLICATIONS,
    MOCK_BLOG_POSTS,
    MOCK_REPAIR_PRICES
} from "../constants";

export const seedDatabase = async () => {
    console.log("Starting database seed...");

    // Helper to chunk array
    const chunkArray = (arr: any[], size: number) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    };

    // Helper to add items in batches
    const processCollection = async (collectionName: string, items: any[]) => {
        const chunks = chunkArray(items, 100); // Batch size 100
        console.log(`Processing ${collectionName}: ${items.length} items in ${chunks.length} batches.`);

        for (let i = 0; i < chunks.length; i++) {
            const batch = writeBatch(db);
            chunks[i].forEach(item => {
                const docRef = doc(collection(db, collectionName), String(item.id));
                const { id, ...data } = item;
                batch.set(docRef, { ...data, id });
            });

            try {
                await batch.commit();
                console.log(`Committed batch ${i + 1}/${chunks.length} for ${collectionName}`);
                // Small delay to prevent freezing
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Error committing batch ${i + 1} for ${collectionName}:`, error);
                throw error;
            }
        }
    };

    try {
        await processCollection('products', MOCK_PRODUCTS);
        await processCollection('shops', MOCK_SHOPS);
        await processCollection('services', MOCK_SERVICES);
        await processCollection('reservations', MOCK_RESERVATIONS);
        await processCollection('quotes', MOCK_QUOTES);
        await processCollection('franchise_applications', MOCK_FRANCHISE_APPLICATIONS);
        await processCollection('blog_posts', MOCK_BLOG_POSTS);

        console.log("Database seeded successfully!");
        alert("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
        alert("Error seeding database. Check console for details.");
    }
};

export const seedRepairPricing = async () => {
    console.log("Seeding repair pricing...");
    const batch = writeBatch(db);

    MOCK_REPAIR_PRICES.forEach(price => {
        const docRef = doc(collection(db, 'repair_prices'), price.id);
        batch.set(docRef, price);
    });

    try {
        await batch.commit();
        console.log("Repair pricing seeded successfully!");
        alert("Repair pricing seeded successfully!");
    } catch (error) {
        console.error("Error seeding repair pricing:", error);
        alert("Error seeding repair pricing. Check console.");
    }
};

export const testRead = async () => {
    console.log("Testing database read...");
    console.log("Current Project ID:", db.app.options.projectId);
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        console.log(`Read success! Found ${querySnapshot.size} documents.`);
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
        });
        alert(`Read success! Found ${querySnapshot.size} documents.`);
    } catch (error) {
        console.error("Error reading database:", error);
        alert("Error reading database. Check console.");
    }
};
