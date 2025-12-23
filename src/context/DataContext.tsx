'use client';
import React, { createContext, ReactNode } from 'react';
import { Reservation, Quote, Product, Service, Shop, FranchiseApplication, BlogPost, RepairPricing, BuybackPriceRecord, StockLog, ContactMessage } from '../types';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    addDoc,
    updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import {
    useProducts,
    useServices,
    useShops,
    useBlogPosts,
    useRepairPrices,
    useReservations,
    useQuotes,
    useFranchiseApplications,
    useBuybackPrices,
    useStockLogs,
    useContactMessages
} from '../hooks/useFirestore';

type ReservationStatus = 'pending' | 'approved' | 'cancelled';
type QuoteStatus = 'new' | 'processing' | 'responded' | 'closed';
type FranchiseApplicationStatus = 'new' | 'reviewing' | 'approved' | 'rejected';
type ContactMessageStatus = 'new' | 'read' | 'replied';

interface DataContextType {
    reservations: Reservation[];
    quotes: Quote[];
    products: Product[];
    services: Service[];
    shops: Shop[];
    franchiseApplications: FranchiseApplication[];
    blogPosts: BlogPost[];
    repairPrices: RepairPricing[];
    buybackPrices: BuybackPriceRecord[];
    stockLogs: StockLog[];
    contactMessages: ContactMessage[];
    addReservation: (reservation: Omit<Reservation, 'id' | 'date' | 'status'>) => void;
    addQuote: (quote: Omit<Quote, 'id' | 'date' | 'status'>) => void;
    addFranchiseApplication: (application: Omit<FranchiseApplication, 'id' | 'date' | 'status'>) => void;
    updateReservationStatus: (id: number | string, status: ReservationStatus) => void;
    updateQuoteStatus: (id: number | string, status: QuoteStatus) => void;
    updateFranchiseApplicationStatus: (id: number | string, status: FranchiseApplicationStatus) => void;
    addContactMessage: (message: Omit<ContactMessage, 'id' | 'date' | 'status' | 'createdAt'>) => void;
    updateContactMessageStatus: (id: number | string, status: ContactMessageStatus) => void;
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: number | string) => void;
    addShop: (shop: Omit<Shop, 'id'>) => void;
    updateShop: (shop: Shop) => void;
    deleteShop: (id: number | string) => void;
    addService: (service: Omit<Service, 'id'>) => void;
    updateService: (service: Service) => void;
    deleteService: (id: number | string) => void;
    addBlogPost: (post: Omit<BlogPost, 'id' | 'date'>) => void;
    updateBlogPost: (post: BlogPost) => void;
    deleteBlogPost: (id: number | string) => void;
    updateRepairPrice: (pricing: RepairPricing) => void;
    logStockMovement: (log: Omit<StockLog, 'id' | 'date'>) => void;
    sendEmail: (to: string, subject: string, html: string, attachments?: { filename: string, content: string, encoding: string }[]) => Promise<void>;
    loading: boolean;
    loadingProducts: boolean;
    loadingServices: boolean;
    loadingShops: boolean;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- FIRESTORE SUBSCRIPTIONS (Refactored to use hooks) ---
    const { products, loading: loadingProducts } = useProducts();
    const { services, loading: loadingServices } = useServices();
    const { shops, loading: shopsLoading } = useShops();
    const { posts: blogPosts, loading: blogLoading } = useBlogPosts();
    const { prices: repairPrices, loading: pricingLoading } = useRepairPrices();
    const { reservations } = useReservations();
    const { quotes } = useQuotes();
    const { applications: franchiseApplications } = useFranchiseApplications();
    const { prices: buybackPrices, loading: buybackLoading } = useBuybackPrices();
    const { logs: stockLogs, loading: stockLoading } = useStockLogs();
    const { messages: contactMessages, loading: messagesLoading } = useContactMessages();

    const loading = loadingProducts || loadingServices || shopsLoading || blogLoading || pricingLoading || buybackLoading || stockLoading || messagesLoading;

    // Sync local state with hooks (optional, but DataContext expects these values in value prop)
    // Actually, we can just pass the values from hooks directly to the Provider value,
    // but the Provider value expects state variables.
    // Let's remove the useState declarations above and use the hook values directly.
    // But wait, the Provider value object uses `reservations`, `quotes`, etc.
    // I need to remove the `useState` lines and just use the variables from hooks.


    // --- FIRESTORE OPERATIONS ---

    const addReservation = async (newReservationData: Omit<Reservation, 'id' | 'date' | 'status'>) => {
        try {
            await addDoc(collection(db, 'reservations'), {
                ...newReservationData,
                date: new Date().toISOString().split('T')[0],
                status: 'pending',
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding reservation: ", error);
        }
    };

    const addQuote = async (newQuoteData: Omit<Quote, 'id' | 'date' | 'status'>) => {
        try {
            await addDoc(collection(db, 'quotes'), {
                ...newQuoteData,
                date: new Date().toISOString().split('T')[0],
                status: 'new',
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding quote: ", error);
        }
    };

    const addFranchiseApplication = async (applicationData: Omit<FranchiseApplication, 'id' | 'date' | 'status'>) => {
        try {
            await addDoc(collection(db, 'franchise_applications'), {
                ...applicationData,
                date: new Date().toISOString().split('T')[0],
                status: 'new',
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding franchise application: ", error);
        }
    };

    const updateReservationStatus = async (id: number | string, status: ReservationStatus) => {
        try {
            const docRef = doc(db, 'reservations', String(id));
            await updateDoc(docRef, { status });
        } catch (error) {
            console.error("Error updating reservation status: ", error);
        }
    };

    const updateQuoteStatus = async (id: number | string, status: QuoteStatus) => {
        try {
            const docRef = doc(db, 'quotes', String(id));
            await updateDoc(docRef, { status });
        } catch (error) {
            console.error("Error updating quote status: ", error);
        }
    };

    const updateFranchiseApplicationStatus = async (id: number | string, status: FranchiseApplicationStatus) => {
        try {
            const docRef = doc(db, 'franchise_applications', String(id));
            await updateDoc(docRef, { status });
        } catch (error) {
            console.error("Error updating franchise application status: ", error);
        }
    };

    const addProduct = async (productData: Omit<Product, 'id'>) => {
        try {
            await addDoc(collection(db, 'products'), {
                ...productData,
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding product: ", error);
        }
    };

    const updateProduct = async (product: Product) => {
        try {
            const { id, ...data } = product;
            await updateDoc(doc(db, 'products', String(id)), data);
        } catch (error) {
            console.error("Error updating product: ", error);
        }
    };

    const deleteProduct = async (id: number | string) => {
        try {
            await deleteDoc(doc(db, 'products', String(id)));
        } catch (error) {
            console.error("Error deleting product: ", error);
        }
    };

    const addShop = async (shopData: Omit<Shop, 'id'>) => {
        try {
            await addDoc(collection(db, 'shops'), {
                ...shopData,
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding shop: ", error);
        }
    };

    const updateShop = async (shop: Shop) => {
        try {
            const { id, ...data } = shop;
            await updateDoc(doc(db, 'shops', String(id)), data);
        } catch (error) {
            console.error("Error updating shop: ", error);
        }
    };

    const deleteShop = async (id: number | string) => {
        try {
            await deleteDoc(doc(db, 'shops', String(id)));
        } catch (error) {
            console.error("Error deleting shop: ", error);
        }
    };

    const addService = async (serviceData: Omit<Service, 'id'>) => {
        try {
            await addDoc(collection(db, 'services'), {
                ...serviceData,
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding service: ", error);
        }
    };

    const updateService = async (service: Service) => {
        try {
            const { id, ...data } = service;
            await updateDoc(doc(db, 'services', String(id)), data);
        } catch (error) {
            console.error("Error updating service: ", error);
        }
    };

    const deleteService = async (id: number | string) => {
        try {
            await deleteDoc(doc(db, 'services', String(id)));
        } catch (error) {
            console.error("Error deleting service: ", error);
        }
    };

    // Blog / CMS Methods
    const addBlogPost = async (postData: Omit<BlogPost, 'id' | 'date'>) => {
        try {
            await addDoc(collection(db, 'blog_posts'), {
                ...postData,
                date: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding blog post: ", error);
        }
    };

    const updateBlogPost = async (updatedPost: BlogPost) => {
        try {
            const { id, ...data } = updatedPost;
            await updateDoc(doc(db, 'blog_posts', String(id)), data);
        } catch (error) {
            console.error("Error updating blog post: ", error);
        }
    };

    const deleteBlogPost = async (id: number | string) => {
        try {
            await deleteDoc(doc(db, 'blog_posts', String(id)));
        } catch (error) {
            console.error("Error deleting blog post: ", error);
        }
    };

    const updateRepairPrice = async (pricing: RepairPricing) => {
        try {
            const { id, ...data } = pricing;
            // Use setDoc with merge: true to create or update
            await setDoc(doc(db, 'repair_prices', String(id)), {
                ...data,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.error("Error updating repair price: ", error);
        }
    };

    const logStockMovement = async (logData: Omit<StockLog, 'id' | 'date'>) => {
        try {
            await addDoc(collection(db, 'stock_logs'), {
                ...logData,
                date: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error logging stock movement: ", error);
        }
    };

    const sendEmail = async (to: string, subject: string, html: string, attachments?: { filename: string, content: string, encoding: string }[]) => {
        const response = await fetch('/api/mail/send-confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, subject, html, attachments })
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                const text = await response.text();
                errorData = { error: 'Could not parse JSON', details: text };
            }
            console.error('Email API Error Details:', {
                status: response.status,
                statusText: response.statusText,
                data: errorData
            });
            throw new Error(errorData.error || `Failed to send email (Status ${response.status})`);
        }
    };

    const addContactMessage = async (msg: Omit<ContactMessage, 'id' | 'date' | 'status' | 'createdAt'>) => {
        try {
            await addDoc(collection(db, 'contact_messages'), {
                ...msg,
                date: new Date().toISOString().split('T')[0],
                status: 'new',
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding contact message:", error);
            throw error;
        }
    };

    const updateContactMessageStatus = async (id: number | string, status: ContactMessageStatus) => {
        try {
            const docRef = doc(db, 'contact_messages', id.toString());
            await updateDoc(docRef, { status });
        } catch (error) {
            console.error("Error updating message status:", error);
        }
    };

    const value = {
        reservations,
        quotes,
        products,
        services,
        shops,
        franchiseApplications,
        blogPosts,
        buybackPrices,
        stockLogs,
        contactMessages,
        addReservation,
        addQuote,
        addFranchiseApplication,
        updateReservationStatus,
        updateQuoteStatus,
        updateFranchiseApplicationStatus,
        addContactMessage,
        updateContactMessageStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        addShop,
        updateShop,
        deleteShop,
        addService,
        updateService,
        deleteService,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        repairPrices,
        updateRepairPrice,
        logStockMovement,
        sendEmail,
        loading,
        loadingProducts,
        loadingServices,
        loadingShops: shopsLoading
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

