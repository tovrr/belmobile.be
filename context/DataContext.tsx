
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Reservation, Quote, Product, Service, Shop, FranchiseApplication, BlogPost } from '../types';
import { MOCK_RESERVATIONS, MOCK_QUOTES, MOCK_PRODUCTS, MOCK_SERVICES, MOCK_SHOPS, MOCK_FRANCHISE_APPLICATIONS, MOCK_BLOG_POSTS } from '../constants';

type ReservationStatus = 'pending' | 'approved' | 'cancelled';
type QuoteStatus = 'new' | 'processing' | 'responded' | 'closed';
type FranchiseApplicationStatus = 'new' | 'reviewing' | 'approved' | 'rejected';


// Helper function to get data from localStorage
const getFromStorage = <T,>(key: string, fallback: T): T => {
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error(`Error parsing ${key} from localStorage`, e);
            return fallback;
        }
    }
    return fallback;
};

interface DataContextType {
    reservations: Reservation[];
    quotes: Quote[];
    products: Product[];
    services: Service[];
    shops: Shop[];
    franchiseApplications: FranchiseApplication[];
    blogPosts: BlogPost[];
    addReservation: (reservation: Omit<Reservation, 'id' | 'date' | 'status'>) => void;
    addQuote: (quote: Omit<Quote, 'id' | 'date' | 'status'>) => void;
    addFranchiseApplication: (application: Omit<FranchiseApplication, 'id' | 'date' | 'status'>) => void;
    updateReservationStatus: (id: number, status: ReservationStatus) => void;
    updateQuoteStatus: (id: number, status: QuoteStatus) => void;
    updateFranchiseApplicationStatus: (id: number, status: FranchiseApplicationStatus) => void;
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (product: Product) => void; // Added updateProduct
    deleteProduct: (id: number) => void;
    updateShop: (shop: Shop) => void; 
    addBlogPost: (post: Omit<BlogPost, 'id' | 'date'>) => void;
    updateBlogPost: (post: BlogPost) => void;
    deleteBlogPost: (id: number) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [reservations, setReservations] = useState<Reservation[]>(() => getFromStorage('belmobile_reservations', MOCK_RESERVATIONS));
    const [quotes, setQuotes] = useState<Quote[]>(() => getFromStorage('belmobile_quotes', MOCK_QUOTES));
    const [products, setProducts] = useState<Product[]>(() => getFromStorage('belmobile_products', MOCK_PRODUCTS));
    const [services, setServices] = useState<Service[]>(() => getFromStorage('belmobile_services', MOCK_SERVICES));
    const [shops, setShops] = useState<Shop[]>(() => getFromStorage('belmobile_shops', MOCK_SHOPS));
    const [franchiseApplications, setFranchiseApplications] = useState<FranchiseApplication[]>(() => getFromStorage('belmobile_franchise_apps', MOCK_FRANCHISE_APPLICATIONS));
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => getFromStorage('belmobile_blog_posts', MOCK_BLOG_POSTS));
    
    // UseEffects to save to localStorage whenever state changes
    useEffect(() => { localStorage.setItem('belmobile_reservations', JSON.stringify(reservations)); }, [reservations]);
    useEffect(() => { localStorage.setItem('belmobile_quotes', JSON.stringify(quotes)); }, [quotes]);
    useEffect(() => { localStorage.setItem('belmobile_products', JSON.stringify(products)); }, [products]);
    useEffect(() => { localStorage.setItem('belmobile_services', JSON.stringify(services)); }, [services]);
    useEffect(() => { localStorage.setItem('belmobile_shops', JSON.stringify(shops)); }, [shops]);
    useEffect(() => { localStorage.setItem('belmobile_franchise_apps', JSON.stringify(franchiseApplications)); }, [franchiseApplications]);
    useEffect(() => { localStorage.setItem('belmobile_blog_posts', JSON.stringify(blogPosts)); }, [blogPosts]);


    const addReservation = (newReservationData: Omit<Reservation, 'id' | 'date' | 'status'>) => {
        const newReservation: Reservation = {
            ...newReservationData,
            id: Date.now(), // Use timestamp for unique ID
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
        };
        setReservations(prev => [newReservation, ...prev]);
    };
    
    const addQuote = (newQuoteData: Omit<Quote, 'id' | 'date' | 'status'>) => {
        const newQuote: Quote = {
            ...newQuoteData,
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            status: 'new',
        };
        setQuotes(prev => [newQuote, ...prev]);
    };

    const addFranchiseApplication = (applicationData: Omit<FranchiseApplication, 'id' | 'date' | 'status'>) => {
        const newApplication: FranchiseApplication = {
            ...applicationData,
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            status: 'new',
        };
        setFranchiseApplications(prev => [newApplication, ...prev]);
    };

    const updateReservationStatus = (id: number, status: ReservationStatus) => {
        setReservations(prev => prev.map(res => res.id === id ? { ...res, status } : res));
    };

    const updateQuoteStatus = (id: number, status: QuoteStatus) => {
        setQuotes(prev => prev.map(quote => quote.id === id ? { ...quote, status } : quote));
    };

    const updateFranchiseApplicationStatus = (id: number, status: FranchiseApplicationStatus) => {
        setFranchiseApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
    };

    const addProduct = (productData: Omit<Product, 'id'>) => {
        const newProduct: Product = {
            ...productData,
            id: Date.now(),
        };
        setProducts(prev => [newProduct, ...prev]);
    };

    const updateProduct = (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const deleteProduct = (id: number) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const updateShop = (updatedShop: Shop) => {
        setShops(prev => prev.map(shop => shop.id === updatedShop.id ? updatedShop : shop));
    };

    // Blog / CMS Methods
    const addBlogPost = (postData: Omit<BlogPost, 'id' | 'date'>) => {
        const newPost: BlogPost = {
            ...postData,
            id: Date.now(),
            date: new Date().toISOString().split('T')[0]
        };
        setBlogPosts(prev => [newPost, ...prev]);
    };

    const updateBlogPost = (updatedPost: BlogPost) => {
        setBlogPosts(prev => prev.map(post => post.id === updatedPost.id ? updatedPost : post));
    };

    const deleteBlogPost = (id: number) => {
        setBlogPosts(prev => prev.filter(post => post.id !== id));
    };

    const value = {
        reservations,
        quotes,
        products,
        services,
        shops,
        franchiseApplications,
        blogPosts,
        addReservation,
        addQuote,
        addFranchiseApplication,
        updateReservationStatus,
        updateQuoteStatus,
        updateFranchiseApplicationStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        updateShop,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
