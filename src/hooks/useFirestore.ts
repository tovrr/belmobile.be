'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Shop, Service, BlogPost, RepairPricing } from '../types';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Product));
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

export const useShops = () => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'shops'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Shop));
            setShops(data);
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
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Service));
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
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as BlogPost));
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
        const unsub = onSnapshot(collection(db, 'repair_pricing'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as RepairPricing));
            setPrices(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching repair prices:", error);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return { prices, loading };
};

export const useReservations = () => {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'reservations'), orderBy('date', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'quotes'), orderBy('date', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'franchise_applications'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

