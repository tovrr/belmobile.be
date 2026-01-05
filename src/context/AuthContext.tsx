'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { AdminProfile } from '../types';

interface AuthContextType {
    user: User | null;
    profile: AdminProfile | null;
    loading: boolean;
    logout: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    updateUserProfile: (name: string, email: string) => Promise<void>;
    updateUserPassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // [SECURITY] UAT Bypass Logic REMOVED.
        // Access strictly controlled by Firebase Auth & Firestore Rules.

        // Subscribe to Firebase Auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    const userEmail = currentUser.email?.toLowerCase();
                    const OWNER_EMAIL = 'omerozkan@live.be';
                    const isOwner = userEmail === OWNER_EMAIL;

                    // 1. Try fetching by UID first
                    console.log("[Auth] Fetching profile for UID:", currentUser.uid);
                    let profileDoc = await getDoc(doc(db, 'users', currentUser.uid));

                    if (profileDoc.exists()) {
                        let profileData = profileDoc.data() as AdminProfile;
                        console.log("[Auth] Profile found in DB. Role:", profileData.role);

                        // --- Safe Bootstrap for System Owner ---
                        if (isOwner && profileData.role !== 'super_admin') {
                            console.log('[Auth] Elevating owner to super_admin...');
                            profileData = { ...profileData, role: 'super_admin' };
                            await setDoc(doc(db, 'users', currentUser.uid), { role: 'super_admin' }, { merge: true });
                        }

                        setProfile(profileData);
                    } else {
                        console.log("[Auth] No profile found for UID. Searching by email:", userEmail);
                        // 2. Fallback: Search by Email
                        const q = query(collection(db, 'users'), where('email', '==', userEmail));
                        const emailSnapshot = await getDocs(q);

                        if (!emailSnapshot.empty) {
                            const foundDoc = emailSnapshot.docs[0];
                            let profileData = foundDoc.data() as AdminProfile;
                            console.log("[Auth] Profile found by email. Claiming...");

                            if (isOwner) profileData.role = 'super_admin';

                            await setDoc(doc(db, 'users', currentUser.uid), {
                                ...profileData,
                                uid: currentUser.uid,
                                claimedAt: new Date().toISOString()
                            });

                            if (foundDoc.id !== currentUser.uid) {
                                await deleteDoc(doc(db, 'users', foundDoc.id));
                            }

                            setProfile({ ...profileData, uid: currentUser.uid });
                        } else {
                            if (isOwner) {
                                console.log('[Auth] Creating FRESH super_admin for OWNER:', userEmail);
                                const freshProfile: AdminProfile = {
                                    uid: currentUser.uid,
                                    email: userEmail!,
                                    displayName: currentUser.displayName || 'Omer Ozkan',
                                    role: 'super_admin',
                                    shopId: 'all',
                                    createdAt: new Date().toISOString()
                                };
                                await setDoc(doc(db, 'users', currentUser.uid), freshProfile);
                                setProfile(freshProfile);
                            } else {
                                console.warn('[Auth] No admin profile for:', userEmail);
                                setProfile(null);
                            }
                        }
                    }
                } catch (error) {
                    console.error('[Auth] Critical error during profile sync:', error);
                    // Fallback for OWNER even on DB error
                    if (currentUser.email?.toLowerCase() === 'omerozkan@live.be') {
                        console.log("[Auth] DB Error but USER IS OWNER. Granting emergency access.");
                        setProfile({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: 'Omer Ozkan (Offline Mode)',
                            role: 'super_admin' as any,
                            shopId: 'all',
                            createdAt: new Date().toISOString()
                        });
                    } else {
                        setProfile(null);
                    }
                }
            } else {
                setProfile(null);
            }

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
        <AuthContext.Provider value={{ user, profile, loading, logout, login, updateUserProfile, updateUserPassword }}>
            {children}
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
