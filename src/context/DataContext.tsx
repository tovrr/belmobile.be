'use client';

import React, { createContext, ReactNode } from 'react';
import { Shop, BlogPost } from '../types';
import { useShops, useBlogPosts } from '../hooks/useFirestore';
import { sendEmail } from '../services/emailService';

interface DataContextType {
    shops: Shop[];
    blogPosts: BlogPost[];
    loading: boolean;
    loadingShops: boolean;
    loadingBlogPosts: boolean;
    sendEmail: typeof sendEmail;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { shops, loading: loadingShops } = useShops();
    const { posts: blogPosts, loading: loadingBlogPosts } = useBlogPosts();

    const loading = loadingShops || loadingBlogPosts;

    const value = {
        shops,
        blogPosts,
        loading,
        loadingShops,
        loadingBlogPosts,
        sendEmail
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
