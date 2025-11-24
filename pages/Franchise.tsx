
import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useData } from '../hooks/useData';
import { FranchiseApplication } from '../types';
import { CheckCircleIcon, BuildingStorefrontIcon, UserGroupIcon, TruckIcon, ChartBarIcon, ArrowRightIcon, BanknotesIcon, BoltIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import MetaTags from '../components/MetaTags';


const InfoCard: React.FC<{ icon: React.ElementType, title: string, description: string }> = ({ icon: Icon, title, description }) => (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-md flex flex-col items-center text-center border border-gray-100 dark:border-slate-700 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 h-full">
        <div className="bg-blue-50 dark:bg-blue-900/20 text-bel-blue dark:text-blue-400 rounded-2xl p-4 mb-6">
            <Icon className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-bel-dark dark:text-white mb-3">{title}</h3>
        <p className="text-bel-gray dark:text-gray-400 leading-relaxed text-sm">{description}</p>
    </div>
);

const Step: React.FC<{ num: number, title: string, description: string }> = ({ num, title, description }) => (
    <div className="flex group">
        <div className="flex flex-col items-center mr-6">
            <div>
                <div className="flex items-center justify-center w-12 h-12 border-2 rounded-full border-gray-200 dark:border-slate-600 group-hover:border-bel-blue dark:group-hover:border-blue-500 transition-colors bg-white dark:bg-slate-800 z-10 relative">
                    <span className="text-lg font-bold text-gray-400 group-hover:text-bel-blue dark:group-hover:text-blue-500">{num}</span>
                </div>
            </div>
            {num < 4 && <div className="w-0.5 h-full bg-gray-200 dark:bg-slate-700 -mt-2 -mb-2"></div>}
        </div>
        <div className="pb-10 pt-2">
            <h4 className="text-xl font-bold text-bel-dark dark:text-white mb-2 group-hover:text-bel-blue dark:group-hover:text-blue-400 transition-colors">{title}</h4>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">{description}</p>
        </div>
    </div>
);


const Franchise: React.FC = () => {
    const { t } = useLanguage();
    const { addFranchiseApplication } = useData();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const applicationData: Omit<FranchiseApplication, 'id' | 'date' | 'status'> = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            locationPreference: formData.get('location') as string,
            investmentCapacity: formData.get('investment') as string,
            background: formData.get('background') as string,
        };
        addFranchiseApplication(applicationData);
        setSubmitted(true);
        e.currentTarget.reset();
        
        // Scroll to confirmation
        const formElement = document.getElementById('apply-form');
        if(formElement) formElement.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToSection = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <MetaTags 
                title={t('meta_franchise_title')} 
                description={t('meta_franchise_description')} 
            />

            {/* Hero Section - Landing Page Style */}
            <div className="relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0">
                     <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1600&auto=format&fit=crop" className="w-full h-full object-cover opacity-10" alt="Mobile Shop Business" />
                     <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900"></div>
                </div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center relative z-10">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-bel-blue/20 border border-blue-500/30 text-blue-300 text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-md animate-fade-in-up">
                         <BoltIcon className="h-4 w-4 mr-2 text-cyber-citron" />
                        {t('franchise_badge')}
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-8 leading-tight">
                        {t('franchise_hero_title')}
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-300 leading-relaxed mb-10">
                        {t('franchise_hero_subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={(e) => scrollToSection(e, 'apply-form')} 
                            className="px-8 py-4 bg-cyber-citron text-slate-900 font-bold rounded-xl hover:bg-white transition-all shadow-glow-accent flex items-center justify-center cursor-pointer"
                        >
                            {t('Start Your Application')} <ArrowRightIcon className="h-5 w-5 ml-2" />
                        </button>
                        <button 
                            onClick={(e) => scrollToSection(e, 'benefits')} 
                            className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 border border-white/20 transition-all backdrop-blur-sm flex items-center justify-center cursor-pointer"
                        >
                            {t('Learn More')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Statistics Section */}
            <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 shadow-sm relative z-20 -mt-8 mx-4 md:mx-auto max-w-6xl rounded-2xl">
                 <div className="px-4 py-8 md:py-10">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100 dark:divide-slate-700">
                         <div>
                             <p className="text-3xl lg:text-4xl font-black text-bel-blue dark:text-blue-400">€35B+</p>
                             <p className="text-xs uppercase tracking-wide text-gray-500 mt-2 font-bold">{t('Market Size')}</p>
                         </div>
                         <div>
                             <p className="text-3xl lg:text-4xl font-black text-green-500">30%</p>
                             <p className="text-xs uppercase tracking-wide text-gray-500 mt-2 font-bold">{t('Avg. Annual Growth')}</p>
                         </div>
                         <div>
                             <p className="text-3xl lg:text-4xl font-black text-bel-blue dark:text-blue-400">15k+</p>
                             <p className="text-xs uppercase tracking-wide text-gray-500 mt-2 font-bold">{t('Repairs / Month')}</p>
                         </div>
                         <div>
                             <p className="text-3xl lg:text-4xl font-black text-bel-blue dark:text-blue-400">3</p>
                             <p className="text-xs uppercase tracking-wide text-gray-500 mt-2 font-bold">{t('Successful Locations')}</p>
                         </div>
                     </div>
                 </div>
            </div>

            {/* Why Belmobile Section */}
            <section id="benefits" className="py-24 bg-gray-50 dark:bg-slate-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-bel-blue dark:text-blue-400 font-bold tracking-widest text-xs uppercase mb-3 block">{t('Why Partner With Us?')}</span>
                        <h2 className="text-3xl md:text-5xl font-black text-bel-dark dark:text-white mb-6">{t('The Belmobile Advantage')}</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">{t('franchise_why_subtitle')}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       <InfoCard icon={BanknotesIcon} title={t('franchise_benefit_1_title')} description={t('franchise_benefit_1_desc')} />
                       <InfoCard icon={TruckIcon} title={t('franchise_benefit_2_title')} description={t('franchise_benefit_2_desc')} />
                       <InfoCard icon={BuildingStorefrontIcon} title={t('franchise_benefit_3_title')} description={t('franchise_benefit_3_desc')} />
                       <InfoCard icon={UserGroupIcon} title={t('franchise_benefit_4_title')} description={t('franchise_benefit_4_desc')} />
                       <InfoCard icon={ChartBarIcon} title={t('franchise_benefit_5_title')} description={t('franchise_benefit_5_desc')} />
                       <InfoCard icon={CheckCircleIcon} title={t('franchise_benefit_6_title')} description={t('franchise_benefit_6_desc')} />
                    </div>
                </div>
            </section>
            
             {/* Requirements & Process Section */}
            <section className="py-24 bg-white dark:bg-slate-800 border-y border-gray-100 dark:border-slate-700">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="order-2 lg:order-1">
                        <h2 className="text-3xl md:text-4xl font-bold text-bel-dark dark:text-white mb-8 leading-tight">{t('Franchisee Profile')}</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                            {t('franchise_profile_intro')}
                        </p>
                        <div className="bg-gray-50 dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
                            <h4 className="font-bold text-lg mb-6 text-gray-900 dark:text-white uppercase tracking-wide flex items-center">
                                <CheckCircleIcon className="h-5 w-5 mr-2 text-bel-blue" />
                                {t('Key Requirements')}
                            </h4>
                            <ul className="space-y-4">
                                {[ 'req_investment', 'req_passion', 'req_experience', 'req_commitment' ].map(key => (
                                    <li key={key} className="flex items-start p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                                        <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3 mt-0.5 flex-shrink-0">
                                            <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{t(key)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                     <div className="order-1 lg:order-2">
                        <div className="bg-gray-50 dark:bg-slate-900 p-10 rounded-[2.5rem] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-bel-blue/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                            <h2 className="text-3xl md:text-4xl font-bold text-bel-dark dark:text-white mb-12">{t('Your Journey to Launch')}</h2>
                            <div className="relative pl-6 border-l-2 border-gray-200 dark:border-slate-700 space-y-12">
                               <Step num={1} title={t('step_1')} description={t('step_1_desc')} />
                               <Step num={2} title={t('step_2')} description={t('step_2_desc')} />
                               <Step num={3} title={t('step_3')} description={t('step_3_desc')} />
                               <Step num={4} title={t('step_4')} description={t('step_4_desc')} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Application Form Section */}
            <section id="apply-form" className="py-24 bg-gray-50 dark:bg-slate-900 scroll-mt-16">
                 <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block py-1 px-3 rounded-full bg-bel-blue/10 text-bel-blue dark:text-blue-300 text-xs font-bold tracking-widest uppercase mb-4">
                            {t('Next Steps')}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-bel-dark dark:text-white mb-6">{t('Ready to Own a Belmobile?')}</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t('apply_form_intro')}</p>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-700 relative overflow-hidden">
                        {/* Decorative gradient blob */}
                        <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-bel-blue via-electric-indigo to-cyber-citron"></div>

                        {submitted ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                                    <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-3xl font-bold text-bel-dark dark:text-white mb-4">{t('Application Submitted!')}</h3>
                                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">{t('franchise_form_success')}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">{t('Full Name')}</label>
                                        <input type="text" name="name" id="name" required autoComplete="name" className="w-full px-5 py-4 border border-gray-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-electric-indigo outline-none transition-all bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white" placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">{t('Email')}</label>
                                        <input type="email" name="email" id="email" required autoComplete="email" className="w-full px-5 py-4 border border-gray-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-electric-indigo outline-none transition-all bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white" placeholder="john@example.com" />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">{t('Phone Number')}</label>
                                        <input type="tel" name="phone" id="phone" required autoComplete="tel" className="w-full px-5 py-4 border border-gray-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-electric-indigo outline-none transition-all bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white" placeholder="+32 400 00 00 00" />
                                    </div>
                                    <div>
                                        <label htmlFor="location" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">{t('Location Preference')}</label>
                                        <input type="text" name="location" id="location" placeholder="e.g., Antwerp, Ghent" required className="w-full px-5 py-4 border border-gray-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-electric-indigo outline-none transition-all bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="investment" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">{t('Investment Capacity')}</label>
                                    <div className="relative">
                                        <select id="investment" name="investment" required className="w-full px-5 py-4 border border-gray-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-electric-indigo outline-none transition-all bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white appearance-none cursor-pointer">
                                            <option value="">{t('Select an amount...')}</option>
                                            <option>€50,000 - €100,000</option>
                                            <option>€100,000 - €150,000</option>
                                            <option>€150,000+</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-500">
                                            <ArrowRightIcon className="h-5 w-5 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="background" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">{t('Background & Experience')}</label>
                                    <textarea name="background" id="background" rows={4} placeholder={t('Tell us briefly about your professional background...')} required className="w-full px-5 py-4 border border-gray-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-electric-indigo outline-none transition-all bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white"></textarea>
                                </div>
                                <div className="pt-6">
                                    <button type="submit" className="w-full bg-electric-indigo text-white font-bold py-5 px-6 rounded-2xl hover:bg-indigo-700 transition-all duration-300 text-xl shadow-xl shadow-indigo-500/30 transform active:scale-[0.98] flex items-center justify-center group">
                                        {t('Submit Application')}
                                        <PaperAirplaneIcon className="h-6 w-6 ml-3 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <p className="text-center text-xs text-gray-400 mt-6">{t('By submitting this form, you agree to our privacy policy.')}</p>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Franchise;
