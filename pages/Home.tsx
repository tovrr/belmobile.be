

import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import ReviewsSection from '../components/ReviewsSection';
import PriceTable from '../components/PriceTable';
import FAQ from '../components/FAQ';
import { useData } from '../hooks/useData';
import { WrenchScrewdriverIcon, ArrowPathRoundedSquareIcon, MapPinIcon, ArrowRightIcon, ShieldCheckIcon, ClockIcon, GlobeEuropeAfricaIcon, DevicePhoneMobileIcon, FireIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../hooks/useLanguage';

const Home: React.FC = () => {
    const { products } = useData();
    const { language, t } = useLanguage();
    const featuredProducts = products.slice(0, 4);

    return (
        <div className="bg-gray-50 dark:bg-deep-space transition-colors duration-300">
            <Hero />

            {/* Trust Signals - Glass Strip */}
            <div className="relative z-10 -mt-10 mb-20">
                <div className="container mx-auto px-4">
                    <div className="glass-panel bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-700">
                            {[
                                { icon: ShieldCheckIcon, title: 'trust_warranty', desc: 'trust_warranty_desc' },
                                { icon: ClockIcon, title: 'trust_speed', desc: 'trust_speed_desc' },
                                { icon: GlobeEuropeAfricaIcon, title: 'trust_eco', desc: 'trust_eco_desc' }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center text-center px-4">
                                    <item.icon className="h-10 w-10 text-electric-indigo mb-4" />
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t(item.title)}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{t(item.desc)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Popular Links - Internal Linking Strategy for SEO */}
            <div className="container mx-auto px-4 mb-12">
                <div className="flex items-center justify-center space-x-4 overflow-x-auto pb-4 no-scrollbar">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap flex items-center">
                        <FireIcon className="h-4 w-4 mr-1 text-orange-500" /> {t('Popular')}:
                    </span>
                    {[
                        { name: 'link_repair_iphone_11', url: '/repair/smartphone/apple/iphone-11' },
                        { name: 'link_sell_iphone_13', url: '/buyback/smartphone/apple/iphone-13' },
                        { name: 'link_repair_s23', url: '/repair/smartphone/samsung/galaxy-s23' },
                        { name: 'link_sell_ps5', url: '/buyback/console/sony/playstation-5-(disc)' },
                        { name: 'link_repair_macbook', url: '/repair/laptop/apple' }
                    ].map((link, idx) => (
                        <Link 
                            key={idx} 
                            to={`/${language}${link.url}`}
                            className="px-4 py-1.5 bg-white dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-bel-blue dark:hover:text-blue-400 hover:border-bel-blue whitespace-nowrap transition-colors"
                        >
                            {t(link.name)}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bento Grid Services */}
            <section className="py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-electric-indigo font-bold tracking-widest text-xs uppercase mb-2 block">{t('Our Expertise')}</span>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">{t('Our Services')}</h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400">{t('Professional solutions for all your mobile needs.')}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-auto md:h-[600px]">
                        
                        {/* Box 1: Repair (Large Vertical) */}
                        <Link to={`/${language}/repair`} className="group relative md:row-span-2 bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-500">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-all group-hover:bg-blue-500/20"></div>
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="bg-blue-100 dark:bg-blue-900/30 w-14 h-14 rounded-2xl flex items-center justify-center text-electric-indigo mb-6">
                                    <WrenchScrewdriverIcon className="h-7 w-7" />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t('Expert Repair')}</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                                    {t("Fast, reliable repairs for screens, batteries, and more. We use premium parts to ensure your device feels brand new.")}
                                </p>
                                <div className="mt-auto">
                                    <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1000&auto=format&fit=crop" className="w-full h-48 object-cover rounded-2xl opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" alt="Repair" />
                                    <div className="mt-6 flex items-center font-bold text-electric-indigo">
                                        {t('Get a Quote')} <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Box 2: Buyback (Wide Horizontal) */}
                        <Link to={`/${language}/buyback`} className="group relative md:col-span-2 bg-slate-900 dark:bg-black rounded-[2rem] p-8 border border-slate-800 overflow-hidden hover:shadow-2xl transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 z-0"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between h-full gap-8">
                                <div className="flex-1">
                                    <div className="bg-green-900/30 w-14 h-14 rounded-2xl flex items-center justify-center text-green-400 mb-6">
                                        <ArrowPathRoundedSquareIcon className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-2">{t('Device Buyback')}</h3>
                                    <p className="text-slate-400 mb-6">{t("Get instant cash for your old phones and tablets.")}</p>
                                    <span className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-xl font-bold group-hover:bg-green-400 transition-colors">
                                        {t('Value Your Device')}
                                    </span>
                                </div>
                                <div className="flex-1 relative h-full min-h-[200px] w-full">
                                    <img src="https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=800&auto=format&fit=crop" className="absolute right-0 top-1/2 -translate-y-1/2 w-40 md:w-full max-w-[180px] md:max-w-sm object-cover rounded-xl shadow-2xl transform rotate-3 group-hover:rotate-0 transition-all duration-500" alt="Buyback" />
                                </div>
                            </div>
                        </Link>

                        {/* Box 3: Shop (Standard) */}
                        <Link to={`/${language}/stores`} className="group relative bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyber-citron/20 rounded-full blur-3xl group-hover:bg-cyber-citron/30 transition-all"></div>
                            <div className="bg-orange-100 dark:bg-orange-900/30 w-14 h-14 rounded-2xl flex items-center justify-center text-orange-500 mb-4">
                                <MapPinIcon className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('3 Locations')}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex-grow">{t("Find a Belmobile store conveniently near you.")}</p>
                            <div className="mt-4 text-orange-500 font-bold text-sm flex items-center group-hover:text-orange-600 transition-colors">
                                {t('Find a Store')} <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                        
                        {/* Box 4: Products (Standard) */}
                        <Link to={`/${language}/products`} className="group relative bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all"></div>
                            <div className="bg-purple-100 dark:bg-purple-900/30 w-14 h-14 rounded-2xl flex items-center justify-center text-purple-500 mb-4">
                                <DevicePhoneMobileIcon className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('Premium Devices')}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex-grow">{t("Shop the latest smartphones and accessories.")}</p>
                            <div className="mt-4 text-purple-500 font-bold text-sm flex items-center group-hover:text-purple-600 transition-colors">
                                {t('View All Products')} <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-20 bg-slate-50 dark:bg-black/20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('Featured Products')}</h2>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">{t('Hand-picked deals just for you.')}</p>
                        </div>
                        <Link to={`/${language}/products`} className="text-electric-indigo font-bold hover:text-indigo-400 transition-colors flex items-center mt-4 sm:mt-0">
                            {t('View All Products')} <ArrowRightIcon className="h-4 w-4 ml-1" />
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Reviews */}
            <ReviewsSection />
            
            {/* Price Table */}
            <PriceTable />
            
            {/* FAQ Section */}
            <section className="py-16 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800">
                <div className="container mx-auto px-4">
                    <FAQ />
                </div>
            </section>

            {/* Franchise CTA - Modern */}
            <section className="relative py-32 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900 dark:bg-black">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric-indigo/20 rounded-full blur-[120px]"></div>
                </div>
                
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md border border-white/20">B2B Opportunity</span>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">{t('franchise_cta_title')}</h2>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-light">{t('franchise_cta_subtitle')}</p>
                    <Link to={`/${language}/franchise`} className="inline-block bg-cyber-citron text-slate-900 font-bold py-5 px-12 rounded-full hover:bg-white hover:scale-105 transition-all duration-300 shadow-glow-accent">
                        {t('Learn More & Apply')}
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
