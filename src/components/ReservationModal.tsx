'use client';

import React, { useState } from 'react';
import { Product, Shop } from '../types';
import { useData } from '../hooks/useData';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../hooks/useLanguage';

interface ReservationModalProps {
    product: Product;
    shop: Shop;
    onClose: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ product, shop, onClose }) => {
    const { addReservation } = useData();
    const { t } = useLanguage();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;

        const reservationData = {
            productId: product.id,
            productName: product.name,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            shopId: shop.id,
        };
        addReservation(reservationData);

        const subject = encodeURIComponent(`Reservation: ${product.name}`);
        const variantDetails = [
            product.capacity ? `Capacity: ${product.capacity}` : '',
            product.color ? `Color: ${product.color}` : '',
            product.condition ? `Condition: ${product.condition}` : ''
        ].filter(Boolean).join('\n');

        const body = encodeURIComponent(`Reservation Request\n\nProduct: ${product.name}\nPrice: €${product.price}\n${variantDetails}\nShop: ${shop.name}\n\nCustomer: ${name}\nEmail: ${email}\nPhone: ${phone}`);
        window.location.href = `mailto:info@belmobile.be?subject=${subject}&body=${body}`;

        setSubmitted(true);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg relative transition-colors duration-300 border border-gray-100 dark:border-slate-700">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                </button>

                {submitted ? (
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-bel-blue dark:text-blue-400 mb-4">{t('Reservation Confirmed!')}</h2>
                        <p className="text-bel-gray dark:text-gray-300">{t('Thank you for your reservation for the {0} at {1}.', product.name, shop.name)}</p>
                        <p className="mt-2 text-sm text-bel-gray dark:text-gray-400">{t('You will receive a confirmation email shortly. You can now close this window.')}</p>
                        <button onClick={onClose} className="mt-6 bg-bel-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800 transition duration-300">
                            {t('Close')}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-bel-dark dark:text-white">{t('Reserve Item')}</h2>
                            <p className="text-sm text-bel-gray dark:text-gray-400 mt-1">{t('You are reserving the {0} at {1}.', product.name, shop.name)}</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Full Name')}</label>
                                <input type="text" name="name" id="name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-bel-blue focus:border-bel-blue sm:text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white transition-colors" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Email')}</label>
                                <input type="email" name="email" id="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-bel-blue focus:border-bel-blue sm:text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white transition-colors" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Phone Number')}</label>
                                <input type="tel" name="phone" id="phone" required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-bel-blue focus:border-bel-blue sm:text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white transition-colors" />
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-bel-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 transition duration-300 shadow-lg shadow-blue-200 dark:shadow-none">
                                    {t('Confirm Reservation')}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReservationModal;
