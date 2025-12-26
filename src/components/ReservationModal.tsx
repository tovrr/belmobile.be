'use client';

import React, { useState } from 'react';
import { Product, Shop } from '../types';
import { useData } from '../hooks/useData';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../hooks/useLanguage';
import Input from './ui/Input';
import Button from './ui/Button';

interface ReservationModalProps {
    product: Product;
    initialShop?: Shop | null;
    onClose: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ product, initialShop, onClose }) => {
    const { addReservation, shops, sendEmail } = useData();
    const { t, language: lang } = useLanguage();
    const [selectedShop, setSelectedShop] = useState<Shop | null>(initialShop || null);
    const [submitted, setSubmitted] = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'shipping'>('pickup');

    const activeShops = shops.filter(s => s.status === 'open');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // For pickup, shop is required. For shipping, we set a default 'HEADQUARTERS' or keep null (but backend might strict check).
        // Let's assume for shipping, shopID is not relevant or we set it to 'ONLINE'.
        if (deliveryMethod === 'pickup' && !selectedShop) return;

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;

        const shippingAddress = formData.get('shippingAddress') as string;
        const shippingCity = formData.get('shippingCity') as string;
        const shippingZip = formData.get('shippingZip') as string;

        const reservationData = {
            productId: product.id,
            productName: product.name,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            shopId: deliveryMethod === 'pickup' ? selectedShop!.id : 'ONLINE',
            deliveryMethod,
            shippingAddress: deliveryMethod === 'shipping' ? shippingAddress : undefined,
            shippingCity: deliveryMethod === 'shipping' ? shippingCity : undefined,
            shippingZip: deliveryMethod === 'shipping' ? shippingZip : undefined,
        };
        addReservation(reservationData);

        // Generate PDF dynamically (Modified to show Delivery info)
        const generatePDF = async () => {
            const { generateReservationPDF, savePDFBlob } = await import('../utils/pdfGenerator');
            // Mocking shop name for PDF if shipping
            const shopNameForPdf = deliveryMethod === 'shipping' ? 'Belmobile Online (Shipping)' : selectedShop!.name;

            const { doc, pdfBase64, safeFileName, blob } = await generateReservationPDF({
                orderId: `RES-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                date: new Date().toLocaleDateString(lang === 'fr' ? 'fr-BE' : lang === 'nl' ? 'nl-BE' : 'en-US'),
                productName: product.name,
                productPrice: product.price,
                shopName: shopNameForPdf,
                customerName: name,
                customerPhone: phone,
                deliveryMethod: deliveryMethod,
                shippingAddress: deliveryMethod === 'shipping' ? `${shippingAddress}, ${shippingZip} ${shippingCity}` : undefined,
                nextSteps: [
                    t('res_step_1'),
                    t('res_step_2'),
                    t('res_step_3')
                ]
            }, t);

            if (blob) {
                savePDFBlob(blob, safeFileName);
            }
            return pdfBase64;
        };

        generatePDF().then(async (pdfBase64) => {
            // Send Email to Customer
            const emailTitle = deliveryMethod === 'shipping' ? t('Reservation Received - Waiting for Payment Link') : t('email_reservation_title');
            const emailBody = deliveryMethod === 'shipping'
                ? `<p>${t('thank_you_shipping_request', product.name)}</p>`
                : `<p>${t('email_reservation_success', product.name, selectedShop!.name)}</p>`;

            try {
                await sendEmail(
                    email,
                    t('email_reservation_subject', product.name),
                    `<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #4338ca; padding: 30px; text-align: center;">
                             <div style="color: #ffffff; font-size: 24px; font-weight: bold;">BELMOBILE.BE</div>
                        </div>
                        <div style="padding: 30px; line-height: 1.6;">
                            <h2 style="color: #4338ca; margin-top: 0;">${emailTitle}</h2>
                            ${emailBody}
                            ${deliveryMethod === 'shipping'
                        ? `<p><strong>${t('Next Step:')}</strong> ${t('We will review your request and send you a secure payment link shorty.')}</p>`
                        : `<p>${t('email_buyback_repair_attachment')}</p>`
                    }
                            <hr style="border: 1px solid #eee; margin: 20px 0;">
                            <p style="font-size: 12px; color: #666;">${t('email_automatic_message')}</p>
                        </div>
                     </div>`,
                    [{
                        filename: `Reservation_${product.name.replace(/\s+/g, '_')}.pdf`,
                        content: pdfBase64,
                        encoding: 'base64'
                    }]
                );
            } catch (emailErr) {
                console.error('Failed to send reservation email:', emailErr);
                alert(t('email_error_customer') || 'Reservation saved, but confirmation email failed. We will contact you soon.');
            }

            // Send Email Copy to Admin
            try {
                await sendEmail(
                    'info@belmobile.be',
                    `[NEW RESERVATION] ${deliveryMethod === 'shipping' ? '📦 SHIP' : '🏪 PICKUP'} - ${product.name}`,
                    `<div style="font-family: sans-serif;">
                        <h2>New Reservation Request</h2>
                        <p><strong>Type:</strong> ${deliveryMethod?.toUpperCase()}</p>
                        <p><strong>Customer:</strong> ${name} (${email})</p>
                        ${deliveryMethod === 'shipping'
                        ? `<p><strong>Address:</strong> ${shippingAddress}, ${shippingZip} ${shippingCity}</p>`
                        : `<p><strong>Shop:</strong> ${selectedShop?.name}</p>`
                    }
                        <p><strong>Phone:</strong> ${phone}</p>
                    </div>`
                );
            } catch (adminEmailErr) {
                console.error('Failed to send admin reservation copy:', adminEmailErr);
            }

            setSubmitted(true);
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-100 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white/90 dark:bg-slate-900/90 glass-panel rounded-3xl shadow-2xl w-full max-w-4xl relative transition-all duration-300 flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>

                {submitted ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                            <CheckCircleIcon className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('Reservation Confirmed!')}</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {deliveryMethod === 'shipping'
                                ? t('We received your shipping request for {0}. Look out for a payment email.', product.name)
                                : t('Thank you for your reservation for the {0} at {1}.', product.name, selectedShop?.name || '')
                            }
                        </p>
                        <button onClick={onClose} className="bg-bel-blue text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                            {t('Close')}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col h-full overflow-hidden">
                        {/* Step 1: Delivery Method Toggle */}
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800 shrink-0">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('How do you want to get it?')}</h2>
                            <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                                <button
                                    onClick={() => setDeliveryMethod('pickup')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${deliveryMethod === 'pickup' ? 'bg-white dark:bg-slate-700 shadow text-bel-blue' : 'text-gray-500'}`}
                                >
                                    {t('In-Store Pickup')}
                                </button>
                                <button
                                    onClick={() => { setDeliveryMethod('shipping'); setSelectedShop(null); }}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${deliveryMethod === 'shipping' ? 'bg-white dark:bg-slate-700 shadow text-bel-blue' : 'text-gray-500'}`}
                                >
                                    {t('Home Delivery')}
                                </button>
                            </div>
                        </div>

                        {/* Step 2: Content based on Toggle */}
                        {deliveryMethod === 'pickup' && !selectedShop ? (
                            <div className="p-6 overflow-y-auto">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('Select a Shop')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {activeShops.map(shop => {
                                        const stock = product.availability?.[shop.id.toString()] || 0;
                                        const isAvailable = stock > 0;
                                        return (
                                            <button
                                                key={shop.id}
                                                onClick={() => isAvailable && setSelectedShop(shop)}
                                                disabled={!isAvailable}
                                                className={`flex flex-col text-left p-5 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden h-full ${isAvailable
                                                    ? 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-bel-blue'
                                                    : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                                    }`}
                                            >
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{shop.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{shop.city}</p>
                                                <div className="mt-auto pt-3">
                                                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {isAvailable ? t('In Stock') : t('Out of Stock')}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4">
                                    <h3 className="font-bold text-bel-blue mb-1">{deliveryMethod === 'pickup' ? t('Picking up at') : t('Delivery Summary')}</h3>
                                    {deliveryMethod === 'pickup' ? (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700 dark:text-gray-300">{selectedShop?.name}</span>
                                            <button type="button" onClick={() => setSelectedShop(null)} className="text-xs text-bel-blue underline">{t('Change')}</button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{t('Secure shipping via Bpost (Tracking included). Shipping calculated at payment.')}</p>
                                    )}
                                </div>

                                <Input label={t('Full Name')} name="name" required placeholder="John Doe" />
                                <Input label={t('Email Address')} name="email" type="email" required placeholder="john@example.com" />
                                <Input label={t('Phone Number')} name="phone" type="tel" required placeholder="+32 400 00 00 00" />

                                {deliveryMethod === 'shipping' && (
                                    <>
                                        <Input label={t('Street Address')} name="shippingAddress" required placeholder="Rue de la Loi 16" />
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-1">
                                                <Input label={t('Zip Code')} name="shippingZip" required placeholder="1000" />
                                            </div>
                                            <div className="col-span-2">
                                                <Input label={t('City')} name="shippingCity" required placeholder="Brussels" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="pt-4">
                                    <Button type="submit" variant="primary" className="w-full">
                                        {t('Confirm Reservation')}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationModal;
