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
        // UAT Bypass Logic (Temporary for Live UAT)
        const params = new URLSearchParams(window.location.search);
        const uatRole = params.get('uat_role');

        if (uatRole) {
            console.log('UAT Mode active:', uatRole);
            const isSuper = uatRole === 'super_admin';
            const mockUser = {
                uid: 'mock-uid-' + uatRole,
                email: isSuper ? 'omerozkan@live.be' : uatRole + '@belmobile.be',
                displayName: isSuper ? 'Omer Ozkan' : 'UAT Manager'
            } as User;

            const mockProfile: AdminProfile = {
                uid: mockUser.uid,
                email: mockUser.email || 'uat@belmobile.be',
                displayName: mockUser.displayName || 'UAT User',
                role: uatRole as any,
                shopId: uatRole === 'shop_manager' || uatRole === 'technician' ? 'gal-brussels' : 'all',
                createdAt: new Date().toISOString()
            };

            setUser(mockUser);
            setProfile(mockProfile);
            setLoading(false);
            return;
        }

        // Subscribe to Firebase Auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    const userEmail = currentUser.email?.toLowerCase();
                    const OWNER_EMAIL = 'omerozkan@live.be';
                    const isOwner = userEmail === OWNER_EMAIL;

                    // 1. Try fetching by UID first
                    let profileDoc = await getDoc(doc(db, 'users', currentUser.uid));

                    if (profileDoc.exists()) {
                        let profileData = profileDoc.data() as AdminProfile;

                        // --- Safe Bootstrap for System Owner ---
                        if (isOwner && profileData.role !== 'super_admin') {
                            console.log('Bootstrapping super_admin for system owner:', userEmail);
                            profileData = { ...profileData, role: 'super_admin' };
                            await setDoc(doc(db, 'users', currentUser.uid), { role: 'super_admin' }, { merge: true });
                        }

                        console.log(`Profile loaded for ${userEmail}:`, profileData.role);
                        setProfile(profileData);
                    } else {
                        // 2. Fallback: Search by Email (for pre-created team profiles)
                        console.log('Searching for profile by email:', userEmail);
                        const q = query(collection(db, 'users'), where('email', '==', userEmail));
                        const emailSnapshot = await getDocs(q);

                        if (!emailSnapshot.empty) {
                            const foundDoc = emailSnapshot.docs[0];
                            let profileData = foundDoc.data() as AdminProfile;

                            // --- Safe Bootstrap for System Owner ---
                            if (isOwner) {
                                profileData = { ...profileData, role: 'super_admin' };
                            }

                            // 3. Claim the profile: Copy document to the new UID ID
                            console.log('Claiming profile found by email...');
                            await setDoc(doc(db, 'users', currentUser.uid), {
                                ...profileData,
                                uid: currentUser.uid,
                                claimedAt: new Date().toISOString()
                            });

                            // Delete the old placeholder document if the ID was different
                            if (foundDoc.id !== currentUser.uid) {
                                await deleteDoc(doc(db, 'users', foundDoc.id));
                            }

                            setProfile({ ...profileData, uid: currentUser.uid });
                        } else {
                            // --- Case: System Owner login with NO existing profile at all ---
                            if (isOwner) {
                                console.log('Creating fresh super_admin profile for system owner...');
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
                                console.warn('No admin profile found for user UID or Email:', currentUser.uid);
                                setProfile(null);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching admin profile:', error);
                    setProfile(null);
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
