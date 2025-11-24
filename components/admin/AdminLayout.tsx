
import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('admin_authenticated');
        if (!isAuthenticated) {
            navigate('/admin/login');
        }
    }, [navigate, location]);

    const handleLogout = () => {
        localStorage.removeItem('admin_authenticated');
        navigate('/admin/login');
    };

    return (
        <div className="flex h-screen bg-gray-50 text-slate-800 font-sans">
            <Sidebar />
            
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Bar */}
                <header className="h-20 flex justify-between items-center px-8 bg-transparent z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                        <p className="text-sm text-slate-500">Welcome back, here's what's happening today.</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                    >
                        <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                        Logout
                    </button>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto px-8 pb-8">
                    {/* Content Container */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 min-h-full p-8 relative">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
