'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Product, Shop, Service, BlogPost, RepairPricing, RepairPriceRecord, Reservation, Quote, FranchiseApplication, BuybackPriceRecord, StockLog, ContactMessage } from '../types';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching products:", error);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return { products, loading };
};

import { SHOPS } from '../constants';

export const useShops = () => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'shops'), (snapshot) => {
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
            // Then group established shops (open/temp_closed) above "coming_soon"
            const priorityIds = ['schaerbeek', 'anderlecht', 'molenbeek'];

            const sortedData = [...data].sort((a, b) => {
                const aIdx = priorityIds.indexOf(a.id as string);
                const bIdx = priorityIds.indexOf(b.id as string);

                // Both in priority list -> sort by index
                if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;

                // One in priority list -> that one goes top
                if (aIdx !== -1) return -1;
                if (bIdx !== -1) return 1;

                // Status Sort: Established above Coming Soon
                const aIsComing = a.status === 'coming_soon';
                const bIsComing = b.status === 'coming_soon';
                if (!aIsComing && bIsComing) return -1;
                if (aIsComing && !bIsComing) return 1;

                // Final sort by name
                return a.name.localeCompare(b.name);
            });

            setShops(sortedData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching shops:", error);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return { shops, loading };
};

export const useServices = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'services'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
            setServices(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching services:", error);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return { services, loading };
};

export const useBlogPosts = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'blog_posts'), orderBy('date', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
            setPosts(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching blog posts:", error);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return { posts, loading };
};

export const useRepairPrices = () => {
    const [prices, setPrices] = useState<RepairPricing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'repair_prices'), (snap) => {
            const pricesRaw = snap.docs.map(d => ({ id: d.id, ...d.data() } as RepairPriceRecord));

            // Standardize into the pricing format
            const aggregated: Record<string, RepairPricing> = {};

            pricesRaw.forEach(record => {
                const { deviceId, issueId, variants, price, isActive = true } = record;
                if (!deviceId || !isActive) return;

                if (!aggregated[deviceId]) aggregated[deviceId] = { id: deviceId };

                // Construct logic-friendly keys
                if (issueId === 'screen' && variants?.quality) {
                    let q = variants.quality.toLowerCase();
                    if (q === 'generic-lcd') q = 'generic';
                    if (q === 'oled-soft') q = 'oled';
                    if (q === 'original-refurb' || q === 'service-pack' || q === 'original-service-pack') q = 'original';
                    aggregated[deviceId][`screen_${q}`] = price;
                } else if (issueId === 'screen' && variants?.position) {
                    aggregated[deviceId][`screen_${variants.position.toLowerCase()}`] = price;
                } else {
                    aggregated[deviceId][issueId] = price;
                }
            });

            const finalPrices: RepairPricing[] = Object.values(aggregated);
            setPrices(finalPrices);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching 'repair_prices':", error);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    return { prices, loading };
};

export const useBuybackPrices = () => {
    const [prices, setPrices] = useState<BuybackPriceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'buyback_pricing'), (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuybackPriceRecord));
            setPrices(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching 'buyback_pricing':", error);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    return { prices, loading };
};

export const useReservations = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.currentUser) {
            const timeoutId = setTimeout(() => setLoading(false), 0);
            return () => clearTimeout(timeoutId);
        }
        const q = query(collection(db, 'reservations'), orderBy('date', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
            setReservations(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching reservations:", error);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return { reservations, loading };
};

export const useQuotes = () => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.currentUser) {
            const timeoutId = setTimeout(() => setLoading(false), 0);
            return () => clearTimeout(timeoutId);
        }
        const q = query(collection(db, 'quotes'), orderBy('date', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quote));
            setQuotes(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching quotes:", error);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return { quotes, loading };
};

export const useFranchiseApplications = () => {
    const [applications, setApplications] = useState<FranchiseApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.currentUser) {
            const timeoutId = setTimeout(() => setLoading(false), 0);
            return () => clearTimeout(timeoutId);
        }
        const unsub = onSnapshot(collection(db, 'franchise_applications'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FranchiseApplication));
            setApplications(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching franchise applications:", error);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return { applications, loading };
};

export const useStockLogs = () => {
    const [logs, setLogs] = useState<StockLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.currentUser) {
            const timeoutId = setTimeout(() => setLoading(false), 0);
            return () => clearTimeout(timeoutId);
        }
        const q = query(collection(db, 'stock_logs'), orderBy('date', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockLog));
            setLogs(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching stock logs:", error);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return { logs, loading };
};

export const useContactMessages = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.currentUser) {
            const timeoutId = setTimeout(() => setLoading(false), 0);
            return () => clearTimeout(timeoutId);
        }
        const q = query(collection(db, 'contact_messages'), orderBy('date', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage));
            setMessages(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching contact messages:", error);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return { messages, loading };
};
