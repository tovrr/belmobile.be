'use client';
import React, { createContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Reservation, Quote, Product, Service, Shop, FranchiseApplication, BlogPost, RepairPricing, BuybackPriceRecord, StockLog, ContactMessage } from '../types';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    addDoc,
    updateDoc,
    getDoc
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
type QuoteStatus = 'new' | 'processing' | 'waiting_parts' | 'repaired' | 'shipped' | 'responded' | 'closed';
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
    updateReservationStatus: (id: number | string, status: ReservationStatus, paymentLink?: string) => void;
    updateQuoteStatus: (id: number | string, status: QuoteStatus, notifyCustomer?: boolean) => void;
    updateQuoteIssues: (id: number | string, issues: string[]) => void;
    deleteReservation: (id: number | string) => void;
    deleteQuote: (id: number | string) => void;
    deleteContactMessage: (id: number | string) => void;
    deleteFranchiseApplication: (id: number | string) => void;
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
    const { user } = useAuth();

    // --- FIRESTORE SUBSCRIPTIONS (Refactored to use hooks) ---
    const { products, loading: loadingProducts } = useProducts();
    const { services, loading: loadingServices } = useServices();
    const { shops, loading: shopsLoading } = useShops();
    const { posts: blogPosts, loading: blogLoading } = useBlogPosts();
    const { prices: repairPrices, loading: pricingLoading } = useRepairPrices();

    // Admin-only data (requires user)
    const { reservations } = useReservations(user);
    const { quotes } = useQuotes(user);
    const { applications: franchiseApplications } = useFranchiseApplications(user);
    const { prices: buybackPrices, loading: buybackLoading } = useBuybackPrices(); // This might need user too if it's admin only, assuming public for now or logic inside
    const { logs: stockLogs, loading: stockLoading } = useStockLogs(user);
    const { messages: contactMessages, loading: messagesLoading } = useContactMessages(user);

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

            // Send Notification Email if Approved
            if (status === 'approved') {
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data() as Reservation;
                    const isShipping = data.deliveryMethod === 'shipping';
                    const subject = isShipping ? "Action Required: Payment for your Order" : "Your Reservation is Ready!";

                    // PLACEHOLDER PAYMENT LINK - User can update this
                    const paymentLink = `https://buy.stripe.com/test_payment_link_placeholder?prefilled_email=${encodeURIComponent(data.customerEmail)}`;

                    const htmlContent = isShipping
                        ? `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #4338ca;">Good news! Your order is confirmed.</h2>
                            <p>We have verified your order for <strong>${data.productName}</strong>.</p>
                            <p>To finalize the shipment to <strong>${data.shippingCity}</strong>, please complete the payment using the secure link below:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${paymentLink}" style="background-color: #4338ca; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Pay Now Securely</a>
                            </div>
                            <p style="color: #666; font-size: 12px;">Link not working? Paste this into your browser: ${paymentLink}</p>
                           </div>`
                        : `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #4338ca;">Your device is ready!</h2>
                            <p>Your reservation for <strong>${data.productName}</strong> has been approved.</p>
                            <p>You can come to pick it up at the shop whenever you are ready.</p>
                           </div>`;

                    await sendEmail(data.customerEmail, subject, htmlContent);
                }
            }
        } catch (error) {
            console.error("Error updating reservation status: ", error);
        }
    };

    const updateQuoteStatus = async (id: number | string, status: QuoteStatus, notifyCustomer: boolean = false) => {
        try {
            const docRef = doc(db, 'quotes', String(id));
            await updateDoc(docRef, { status });

            if (notifyCustomer) {
                // Fetch quote to get customer email and lang
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data() as Quote;
                    const lang = data.language || 'en';
                    const trackingUrl = `https://belmobile.be/${lang}/track-order?id=${id}&email=${encodeURIComponent(data.customerEmail)}`;

                    const subjects: Record<string, string> = {
                        en: `Update on your order #${String(id).substring(0, 6).toUpperCase()}`,
                        fr: `Mise à jour de votre commande #${String(id).substring(0, 6).toUpperCase()}`,
                        nl: `Update over uw bestelling #${String(id).substring(0, 6).toUpperCase()}`
                    };

                    const statusMessages: Record<string, Record<string, string>> = {
                        en: {
                            new: 'We have received your request and will process it shortly.',
                            waiting_parts: 'We are currently waiting for parts to complete your repair.',
                            in_repair: 'Your device is currently being repaired by our experts.',
                            repaired: 'Great news! Your device has been successfully repaired.',
                            ready: 'Your device is ready for pickup! Please visit our shop during opening hours.',
                            shipped: 'Your order has been shipped. Track it using the link below.',
                            processing: 'We are processing your order.',
                            responded: 'We have responded to your request.',
                            closed: 'Your order is now closed. Thank you for choosing Belmobile!'
                        },
                        fr: {
                            new: 'Nous avons bien reçu votre demande et la traiterons sous peu.',
                            waiting_parts: 'Nous attendons actuellement des pièces pour terminer votre réparation.',
                            in_repair: 'Votre appareil est en cours de réparation par nos experts.',
                            repaired: 'Bonne nouvelle ! Votre appareil a été réparé avec succès.',
                            ready: 'Votre appareil est prêt ! Passez le récupérer en magasin durant les heures d\'ouverture.',
                            shipped: 'Votre commande a été expédiée. Suivez-la via le lien ci-dessous.',
                            processing: 'Nous traitons votre commande.',
                            responded: 'Nous avons répondu à votre demande.',
                            closed: 'Votre commande est maintenant clôturée. Merci d\'avoir choisi Belmobile !'
                        },
                        nl: {
                            new: 'We hebben uw aanvraag ontvangen en zullen deze spoedig behandelen.',
                            waiting_parts: 'We wachten momenteel op onderdelen om uw reparatie te voltooien.',
                            in_repair: 'Uw apparaat wordt momenteel hersteld door onze experts.',
                            repaired: 'Goed nieuws! Uw apparaat is succesvol gerepareerd.',
                            ready: 'Uw apparaat ligt klaar! Kom langs in de winkel tijdens de openingsuren.',
                            shipped: 'Uw bestelling is verzonden. Volg het via de onderstaande link.',
                            processing: 'We verwerken uw bestelling.',
                            responded: 'We hebben gereageerd op uw verzoek.',
                            closed: 'Uw bestelling is nu afgerond. Bedankt voor het kiezen van Belmobile!'
                        }
                    };

                    const message = statusMessages[lang]?.[status] || statusMessages['en'][status] || `Status updated to: ${status}`;
                    const subject = subjects[lang] || subjects['en'];

                    await sendEmail(
                        data.customerEmail,
                        subject,
                        `
                        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                            <div style="background-color: #4338ca; padding: 30px; text-align: center;">
                                <div style="color: #ffffff; font-size: 24px; font-weight: bold;">BELMOBILE.BE</div>
                            </div>
                            <div style="padding: 30px;">
                                <h2 style="color: #4338ca;">Order Update</h2>
                                <p>${message}</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${trackingUrl}" style="background-color: #4338ca; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Track Your Order</a>
                                </div>
                                <hr style="border: 1px solid #eee; margin: 20px 0;">
                                <p style="font-size: 12px; color: #666;">Order ID: ${id}</p>
                            </div>
                        </div>
                        `
                    );
                }
            }
        } catch (error) {
            console.error("Error updating quote status: ", error);
        }
    };

    const updateQuoteIssues = async (id: number | string, issues: string[]) => {
        try {
            const docRef = doc(db, 'quotes', String(id));
            await updateDoc(docRef, { issues });
        } catch (error) {
            console.error("Error updating quote issues: ", error);
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

    const deleteContactMessage = async (id: number | string) => {
        try {
            await deleteDoc(doc(db, 'contact_messages', String(id)));
        } catch (error) {
            console.error("Error deleting contact message: ", error);
        }
    };

    const deleteFranchiseApplication = async (id: number | string) => {
        try {
            await deleteDoc(doc(db, 'franchise_applications', String(id)));
        } catch (error) {
            console.error("Error deleting franchise application: ", error);
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
        updateQuoteIssues,
        deleteReservation,
        deleteQuote,
        deleteContactMessage,
        deleteFranchiseApplication,
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

