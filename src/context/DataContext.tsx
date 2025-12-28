'use client';

import React, { createContext, ReactNode } from 'react';
import { Shop, BlogPost } from '../types';
import { useShops, useBlogPosts } from '../hooks/useFirestore';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { sendEmail } from '../services/emailService';

interface DataContextType {
    shops: Shop[];
    blogPosts: BlogPost[];
    loading: boolean;
    loadingShops: boolean;
    loadingBlogPosts: boolean;
    sendEmail: typeof sendEmail;
    // Shops CRUD
    addShop: (shop: Omit<Shop, 'id'>) => Promise<void>;
    updateShop: (id: string, data: Partial<Shop>) => Promise<void>;
    deleteShop: (id: string) => Promise<void>;
    // Blog CRUD
    addBlogPost: (post: Omit<BlogPost, 'id'>) => Promise<void>;
    updateBlogPost: (id: string, data: Partial<BlogPost>) => Promise<void>;
    deleteBlogPost: (id: string) => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { shops, loading: loadingShops } = useShops();
    const { posts: blogPosts, loading: loadingBlogPosts } = useBlogPosts();

    const loading = loadingShops || loadingBlogPosts;

    // --- Shops CRUD ---
    const addShop = async (shopData: Omit<Shop, 'id'>) => {
        await addDoc(collection(db, 'shops'), shopData);
    };

    const updateShop = async (id: string, data: Partial<Shop>) => {
        await updateDoc(doc(db, 'shops', id), data);
    };

    const deleteShop = async (id: string) => {
        await deleteDoc(doc(db, 'shops', id));
    };

    // --- Blog Posts CRUD ---
    const addBlogPost = async (postData: Omit<BlogPost, 'id'>) => {
        await addDoc(collection(db, 'blog_posts'), postData);
    };

    const updateBlogPost = async (id: string, data: Partial<BlogPost>) => {
        await updateDoc(doc(db, 'blog_posts', id), data);
    };

    const deleteBlogPost = async (id: string) => {
        await deleteDoc(doc(db, 'blog_posts', id));
    };

    const value = {
        shops,
        blogPosts,
        loading,
        loadingShops,
        loadingBlogPosts,
        sendEmail,
        addShop,
        updateShop,
        deleteShop,
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
