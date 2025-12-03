'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    updateUserProfile: (name: string, email: string) => Promise<void>;
    updateUserPassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to Firebase Auth state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const updateUserProfile = async (name: string, email: string) => {
        if (auth.currentUser) {
            const { updateProfile, updateEmail } = await import('firebase/auth');
            if (name !== auth.currentUser.displayName) {
                await updateProfile(auth.currentUser, { displayName: name });
            }
            if (email !== auth.currentUser.email) {
                await updateEmail(auth.currentUser, email);
            }
            // Force refresh user state
            setUser({ ...auth.currentUser, displayName: name, email: email });
        }
    };

    const updateUserPassword = async (password: string) => {
        if (auth.currentUser) {
            const { updatePassword } = await import('firebase/auth');
            await updatePassword(auth.currentUser, password);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, login, updateUserProfile, updateUserPassword }}>
            {/* Prevent flashing of protected content or redirects while loading */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

