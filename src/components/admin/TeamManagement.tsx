'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../hooks/useData';
import { useAdminUsers } from '../../hooks/useFirestore';
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon, ShieldCheckIcon, UserIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { db } from '../../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { AdminProfile, UserRole } from '../../types';

const TeamManagement: React.FC = () => {
    const { user: currentUser, profile } = useAuth();

    if (profile?.role !== 'super_admin') {
        return <div className="p-8 text-center font-bold text-red-500">Access Denied</div>;
    }

    const { shops } = useData();
    const { users, loading } = useAdminUsers(currentUser);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminProfile | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        displayName: '',
        role: 'shop_manager' as UserRole,
        shopId: 'schaerbeek'
    });

    const handleOpenModal = (userToEdit?: AdminProfile) => {
        if (userToEdit) {
            setEditingUser(userToEdit);
            setFormData({
                email: userToEdit.email || '',
                displayName: userToEdit.displayName || 'UAT Manager',
                role: userToEdit.role,
                shopId: userToEdit.shopId || 'schaerbeek'
            });
        } else {
            setEditingUser(null);
            setFormData({
                email: '',
                displayName: '',
                role: 'shop_manager',
                shopId: 'schaerbeek'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // UID is generated if new, otherwise kept
            // If new, we use the email as a temporary key or wait for the "AuthContext" claim logic
            // To keep it simple, we'll use a slug of the email if it's a new profile without a UID yet
            const docId = editingUser?.uid || `profile_${formData.email.replace(/[^a-zA-Z0-9]/g, '_')}`;

            await setDoc(doc(db, 'users', docId), {
                ...formData,
                uid: docId,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving team member:", error);
            alert("Failed to save member.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (uid: string) => {
        if (uid === currentUser?.uid) {
            alert("You cannot delete yourself.");
            return;
        }
        if (!confirm("Are you sure you want to remove this team member?")) return;

        try {
            await deleteDoc(doc(db, 'users', uid));
        } catch (error) {
            console.error("Error deleting team member:", error);
            alert("Failed to delete member.");
        }
    };

    const getRoleBadge = (role: UserRole) => {
        switch (role) {
            case 'super_admin':
                return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><ShieldCheckIcon className="h-3 w-3" /> Super Admin</span>;
            case 'shop_manager':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><UserIcon className="h-3 w-3" /> Shop Manager</span>;
            case 'technician':
                return <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><WrenchScrewdriverIcon className="h-3 w-3" /> Technician</span>;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Team Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage administrators, managers and technicians for all locations.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-6 py-3 bg-bel-blue text-white rounded-2xl font-bold shadow-lg shadow-blue-500/25 hover:scale-[1.02] transition-all"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Team Member
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-bold">User</th>
                                <th scope="col" className="px-6 py-4 font-bold">Role</th>
                                <th scope="col" className="px-6 py-4 font-bold">Assigned Shop</th>
                                <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bel-blue mx-auto"></div>
                                    </td>
                                </tr>
                            ) : users.map(u => (
                                <tr key={u.uid} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 font-bold">
                                                {u.displayName?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">{u.displayName || 'Unnamed'}</div>
                                                <div className="text-xs text-gray-400">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getRoleBadge(u.role)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.role === 'super_admin' ? (
                                            <span className="text-xs text-gray-400 italic">All Access</span>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700 dark:text-gray-300">{shops.find(s => s.id === u.shopId)?.name || u.shopId}</span>
                                                <span className="text-[10px] text-gray-400 uppercase">{u.shopId}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(u)}
                                                className="p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-blue-400 rounded-xl transition-all"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(u.uid)}
                                                className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-all"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl border border-white/20 animate-slide-up overflow-hidden">
                        <div className="p-8 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-linear-to-r from-bel-blue to-purple-600">
                            <div>
                                <h2 className="text-2xl font-black text-white">{editingUser ? 'Edit Member' : 'Add Member'}</h2>
                                <p className="text-blue-100 text-xs mt-1">Define permissions and locations.</p>
                            </div>
                            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <UserGroupIcon className="h-6 w-6 text-white" />
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-bel-blue outline-none transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-bel-blue outline-none transition-all"
                                        placeholder="john@belmobile.be"
                                        disabled={!!editingUser}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-bel-blue outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="super_admin">Super Admin</option>
                                            <option value="shop_manager">Shop Manager</option>
                                            <option value="technician">Technician</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Assign Shop</label>
                                        <select
                                            value={formData.shopId}
                                            disabled={formData.role === 'super_admin'}
                                            onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-bel-blue outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                                        >
                                            {shops.map(s => <option key={s.id} value={s.id}>{s.name || s.id}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-4 border border-gray-200 dark:border-slate-700 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 px-6 py-4 bg-bel-blue text-white rounded-2xl font-bold shadow-lg shadow-blue-500/25 hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManagement;
