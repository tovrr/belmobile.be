'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
    Reservation, Quote, FranchiseApplication, ContactMessage
} from '../types';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import {
    useReservations,
    useQuotes,
    useFranchiseApplications,
    useContactMessages
} from '../hooks/useFirestore';
import { sendEmail } from '../services/emailService';
import { getQuoteStatusEmail, getReservationStatusEmail } from '../utils/emailTemplates';

// These types are derived to ensure consistency
type ReservationStatus = Reservation['status'];
type QuoteStatus = Quote['status'];
type FranchiseApplicationStatus = FranchiseApplication['status'];
type ContactMessageStatus = ContactMessage['status'];

interface OrderContextType {
    reservations: Reservation[];
    quotes: Quote[];
    franchiseApplications: FranchiseApplication[];
    contactMessages: ContactMessage[];
    adminShopFilter: string;
    setAdminShopFilter: (shopId: string) => void;
    loadingOrders: boolean;
    hasMoreReservations: boolean;
    loadMoreReservations: () => Promise<void>;
    hasMoreQuotes: boolean;
    loadMoreQuotes: () => Promise<void>;
    addReservation: (newReservationData: Omit<Reservation, 'id' | 'date' | 'status'>) => Promise<void>;
    addQuote: (newQuoteData: Omit<Quote, 'id' | 'date' | 'status'>) => Promise<void>;
    addFranchiseApplication: (applicationData: Omit<FranchiseApplication, 'id' | 'date' | 'status'>) => Promise<void>;
    addContactMessage: (msg: Omit<ContactMessage, 'id' | 'date' | 'status' | 'createdAt'>) => Promise<void>;
    updateReservationStatus: (id: number | string, status: ReservationStatus, paymentLink?: string, isPaid?: boolean) => Promise<void>;
    updateReservationFields: (id: number | string, updates: Partial<Reservation>) => Promise<void>;
    updateQuoteStatus: (id: number | string, status: QuoteStatus, notifyCustomer?: boolean, extraFields?: Partial<Quote>) => Promise<void>;
    updateQuoteFields: (id: number | string, updates: Partial<Quote>) => Promise<void>;
    updateQuoteIssues: (id: number | string, issues: string[]) => Promise<void>;
    updateFranchiseApplicationStatus: (id: number | string, status: FranchiseApplicationStatus) => Promise<void>;
    updateContactMessageStatus: (id: number | string, status: ContactMessageStatus) => Promise<void>;
    deleteReservation: (id: number | string) => Promise<void>;
    deleteQuote: (id: number | string) => Promise<void>;
    deleteFranchiseApplication: (id: number | string) => Promise<void>;
    deleteContactMessage: (id: number | string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [adminShopFilter, setAdminShopFilter] = useState('all');

    const { reservations, loading: loadRes, hasMore: hasMoreReservations, loadMore: loadMoreReservations } = useReservations(user, adminShopFilter);
    const { quotes, loading: loadQuotes, hasMore: hasMoreQuotes, loadMore: loadMoreQuotes } = useQuotes(user, adminShopFilter);
    const { applications: franchiseApplications, loading: loadFran } = useFranchiseApplications(user);
    const { messages: contactMessages, loading: loadMsg } = useContactMessages(user, adminShopFilter);

    const loadingOrders = loadRes || loadQuotes || loadFran || loadMsg;

    const addReservation = async (newReservationData: Omit<Reservation, 'id' | 'date' | 'status'>) => {
        try {
            await addDoc(collection(db, 'reservations'), {
                ...newReservationData,
                date: new Date().toISOString(),
                status: 'pending'
            });
        } catch (error) {
            console.error("Error adding reservation: ", error);
        }
    };

    const addQuote = async (newQuoteData: Omit<Quote, 'id' | 'date' | 'status'>) => {
        try {
            await addDoc(collection(db, 'quotes'), {
                ...newQuoteData,
                date: new Date().toISOString(),
                status: 'new'
            });
        } catch (error) {
            console.error("Error adding quote: ", error);
        }
    };

    const addFranchiseApplication = async (applicationData: Omit<FranchiseApplication, 'id' | 'date' | 'status'>) => {
        try {
            await addDoc(collection(db, 'franchise_applications'), {
                ...applicationData,
                date: new Date().toISOString(),
                status: 'new'
            });
        } catch (error) {
            console.error("Error adding franchise application: ", error);
        }
    };

    const addContactMessage = async (msg: Omit<ContactMessage, 'id' | 'date' | 'status' | 'createdAt'>) => {
        try {
            const now = new Date();
            await addDoc(collection(db, 'contact_messages'), {
                ...msg,
                date: now.toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }).replace(',', ''),
                status: 'new',
                createdAt: now.toISOString()
            });
        } catch (error) {
            console.error("Error adding contact message:", error);
            throw error;
        }
    };

    const updateReservationStatus = async (id: number | string, status: ReservationStatus, paymentLink?: string, isPaid?: boolean) => {
        try {
            const docRef = doc(db, 'reservations', String(id));
            const updates: any = { status };
            if (paymentLink !== undefined) updates.paymentLink = paymentLink;
            if (isPaid !== undefined) updates.isPaid = isPaid;
            await updateDoc(docRef, updates);

            if (status === 'approved' || status === 'ready') {
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data() as Reservation;
                    const lang = (data as any).language || 'fr';
                    const { subject, html } = getReservationStatusEmail(data, String(id), lang, paymentLink);
                    await sendEmail(data.customerEmail, subject, html);
                }
            }
        } catch (error) {
            console.error("Error updating reservation status: ", error);
        }
    };

    const updateReservationFields = async (id: number | string, updates: Partial<Reservation>) => {
        try {
            await updateDoc(doc(db, 'reservations', String(id)), updates);
        } catch (error) {
            console.error("Error updating reservation fields: ", error);
        }
    };

    const updateQuoteStatus = async (id: number | string, status: QuoteStatus, notifyCustomer: boolean = false, extraFields: Partial<Quote> = {}) => {
        try {
            const docRef = doc(db, 'quotes', String(id));
            await updateDoc(docRef, { status, ...extraFields });

            if (notifyCustomer) {
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data() as Quote;
                    const lang = (data.language || 'en') as 'en' | 'fr' | 'nl';
                    const { subject, html } = getQuoteStatusEmail(data, String(id), lang);
                    await sendEmail(data.customerEmail, subject, html);
                }
            }
        } catch (error) {
            console.error("Error updating quote status: ", error);
        }
    };

    const updateQuoteFields = async (id: number | string, updates: Partial<Quote>) => {
        try {
            await updateDoc(doc(db, 'quotes', String(id)), updates);
        } catch (error) {
            console.error("Error updating quote fields: ", error);
        }
    };

    const updateQuoteIssues = async (id: number | string, issues: string[]) => {
        try {
            await updateDoc(doc(db, 'quotes', String(id)), { issues });
        } catch (error) {
            console.error("Error updating quote issues: ", error);
        }
    };

    const updateFranchiseApplicationStatus = async (id: number | string, status: FranchiseApplicationStatus) => {
        try {
            await updateDoc(doc(db, 'franchise_applications', String(id)), { status });
        } catch (error) {
            console.error("Error updating franchise status: ", error);
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

    const deleteReservation = async (id: number | string) => {
        try {
            await deleteDoc(doc(db, 'reservations', String(id)));
        } catch (error) {
            console.error("Error deleting reservation: ", error);
        }
    };

    const deleteQuote = async (id: number | string) => {
        try {
            await deleteDoc(doc(db, 'quotes', String(id)));
        } catch (error) {
            console.error("Error deleting quote: ", error);
        }
    };

    const deleteFranchiseApplication = async (id: number | string) => {
        try {
            await deleteDoc(doc(db, 'franchise_applications', String(id)));
        } catch (error) {
            console.error("Error deleting franchise application: ", error);
        }
    };

    const deleteContactMessage = async (id: number | string) => {
        try {
            await deleteDoc(doc(db, 'contact_messages', String(id)));
        } catch (error) {
            console.error("Error deleting contact message: ", error);
        }
    };

    const value = {
        reservations,
        quotes,
        franchiseApplications,
        contactMessages,
        adminShopFilter,
        setAdminShopFilter,
        loadingOrders,
        hasMoreReservations,
        loadMoreReservations,
        hasMoreQuotes,
        loadMoreQuotes,
        addReservation,
        addQuote,
        addFranchiseApplication,
        addContactMessage,
        updateReservationStatus,
        updateReservationFields,
        updateQuoteStatus,
        updateQuoteFields,
        updateQuoteIssues,
        updateFranchiseApplicationStatus,
        updateContactMessageStatus,
        deleteReservation,
        deleteQuote,
        deleteFranchiseApplication,
        deleteContactMessage
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};
