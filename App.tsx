
import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet, Navigate, useParams } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { DataProvider } from './context/DataContext';
import { LanguageProvider, useLanguage } from './hooks/useLanguage';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import BuybackRepair from './pages/BuybackRepair';
import StoreLocator from './pages/StoreLocator';
import Contact from './pages/Contact';
import Franchise from './pages/Franchise';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import FAQPage from './pages/FAQPage';
import TermsPrivacy from './pages/TermsPrivacy';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import ShopManagement from './pages/admin/ShopManagement';
import ReservationManagement from './pages/admin/ReservationManagement';
import QuoteManagement from './pages/admin/QuoteManagement';
import FranchiseManagement from './pages/admin/FranchiseManagement';
import BlogManagement from './pages/admin/BlogManagement';
import AIChatAssistant from './components/AIChatAssistant';
import SchemaMarkup from './components/SchemaMarkup';
import Breadcrumbs from './components/Breadcrumbs';
import SEOMigrationHandler from './components/SEOMigrationHandler';

const ScrollToTop = () => {
    const { pathname, hash } = useLocation();
    const prevPathRef = useRef(pathname);

    useEffect(() => {
        // If there is a hash (anchor), let the browser handle the scroll to the element
        if (hash) return;

        // Helper to strip language prefix to compare core routes
        const getCleanPath = (path: string) => path.replace(/^\/(en|fr|nl)/, '');

        const prevCleanPath = getCleanPath(prevPathRef.current);
        const currentCleanPath = getCleanPath(pathname);

        // Only scroll to top if the actual page content changed
        if (prevCleanPath !== currentCleanPath) {
            window.scrollTo(0, 0);
        }

        prevPathRef.current = pathname;
    }, [pathname, hash]);

    return null;
};

const MainLayout = () => {
    const { lang } = useParams<{ lang: string }>();
    const { setLanguage, language } = useLanguage();

    useEffect(() => {
        // Sync URL param with Context State
        if (lang && ['en', 'fr', 'nl'].includes(lang) && lang !== language) {
            setLanguage(lang as 'en' | 'fr' | 'nl');
        }
    }, [lang, setLanguage, language]);

    return (
        <div className="min-h-screen flex flex-col font-sans text-slate-900 dark:text-white bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
             <ScrollToTop />
             <SchemaMarkup />
             <Header />
             <Breadcrumbs />
             <main className="flex-grow relative z-0">
                <Outlet />
             </main>
             <Footer />
             <AIChatAssistant />
        </div>
    );
};

const LanguageRedirect = () => {
    const { language } = useLanguage();
    return <Navigate to={`/${language}`} replace />;
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <DataProvider>
                    <ShopProvider>
                        <BrowserRouter>
                            {/* Handler placed here to catch URLs before Routes logic potentially redirects to 404 */}
                            <SEOMigrationHandler />
                            
                            <Routes>
                                <Route path="/" element={<LanguageRedirect />} />
                                <Route path="/:lang" element={<MainLayout />}>
                                    <Route index element={<Home />} />
                                    <Route path="products" element={<Products />} />
                                    <Route path="repair" element={<BuybackRepair type="repair" />} />
                                    <Route path="buyback" element={<BuybackRepair type="buyback" />} />
                                    <Route path="stores" element={<StoreLocator />} />
                                    <Route path="contact" element={<Contact />} />
                                    <Route path="franchise" element={<Franchise />} />
                                    <Route path="blog" element={<Blog />} />
                                    <Route path="blog/:id" element={<BlogPost />} />
                                    <Route path="faq" element={<FAQPage />} />
                                    <Route path="terms" element={<TermsPrivacy />} />
                                </Route>

                                <Route path="/admin/login" element={<AdminLogin />} />
                                <Route path="/admin" element={<AdminLayout />}>
                                    <Route index element={<Navigate to="dashboard" replace />} />
                                    <Route path="dashboard" element={<Dashboard />} />
                                    <Route path="products" element={<ProductManagement />} />
                                    <Route path="services" element={<ServiceManagement />} />
                                    <Route path="shops" element={<ShopManagement />} />
                                    <Route path="reservations" element={<ReservationManagement />} />
                                    <Route path="quotes" element={<QuoteManagement />} />
                                    <Route path="franchise" element={<FranchiseManagement />} />
                                    <Route path="content" element={<BlogManagement />} />
                                </Route>
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </BrowserRouter>
                    </ShopProvider>
                </DataProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
};

export default App;
