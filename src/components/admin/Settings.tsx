'use client';

import React, { useState, useEffect } from 'react';
import { UserCircleIcon, BellIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const Settings: React.FC = () => {
    const { user, updateUserProfile, updateUserPassword } = useAuth();

    // Profile State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    useEffect(() => {
        if (user) {
            const names = (user.displayName || '').split(' ');
            setFirstName(names[0] || '');
            setLastName(names.slice(1).join(' ') || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileLoading(true);
        try {
            const fullName = `${firstName} ${lastName}`.trim();
            await updateUserProfile(fullName, email);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(`Failed to update profile: ${(error as Error).message}`);
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("New passwords don't match!");
            return;
        }
        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        setIsPasswordLoading(true);
        try {
            // Note: Firebase requires re-authentication for password updates if the session is old.
            // For simplicity here, we assume the session is active. 
            // In a production app, you'd handle re-auth here.
            await updateUserPassword(newPassword);
            alert('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error updating password:', error);
            // Safe to assume error has message if we cast or check
            alert(`Failed to update password: ${(error as Error).message}`);
        } finally {
            setIsPasswordLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and application preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Settings */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-bel-blue">
                                <UserCircleIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Update your account&apos;s profile information and email address.</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isProfileLoading}
                                    className="px-6 py-3 bg-bel-blue text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all disabled:opacity-50"
                                >
                                    {isProfileLoading ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                                <LockClosedIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Ensure your account is using a long, random password to stay secure.</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                            {/* Note: Current password field is often needed for re-auth, but for simple updatePassword call if session is fresh, it might not be strictly required by the SDK method itself, though good practice for UI flow. */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Current Password (for verification)</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isPasswordLoading}
                                    className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50"
                                >
                                    {isPasswordLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Side Settings */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-yellow-600 dark:text-yellow-400">
                                <BellIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage how you receive notifications.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Email Notifications</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-bel-blue"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">New Order Alerts</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-bel-blue"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                                <GlobeAltIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Language</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred language.</p>
                            </div>
                        </div>
                        <select className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition">
                            <option>English</option>
                            <option>Français</option>
                            <option>Nederlands</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
