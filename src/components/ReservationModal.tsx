'use client';

import React, { useState } from 'react';
import { Product, Shop } from '../types';
import { useData } from '../hooks/useData';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../hooks/useLanguage';
import Input from './ui/Input';
import Button from './ui/Button';
import { jsPDF } from 'jspdf';

interface ReservationModalProps {
    product: Product;
    initialShop?: Shop | null;
    onClose: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ product, initialShop, onClose }) => {
    const { addReservation, shops, sendEmail } = useData();
    const { t } = useLanguage();
    const [selectedShop, setSelectedShop] = useState<Shop | null>(initialShop || null);
    const [submitted, setSubmitted] = useState(false);

    const activeShops = shops.filter(s => s.status === 'open');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedShop) return;

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
            shopId: selectedShop.id,
        };
        addReservation(reservationData);

        // Simplified Header
        const doc = new jsPDF();
        doc.setFillColor(67, 56, 202);
        doc.rect(0, 0, 210, 30, 'F');

        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('BELMOBILE', 20, 15);
        doc.setTextColor(255, 222, 0); // Yellow
        doc.text('.BE', 66, 15);

        // Precise Justification for Slogan
        const brandWidth = doc.getTextWidth('BELMOBILE');
        const sloganText = 'BUYBACK & REPAIR';
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');

        const sloganWidth = doc.getTextWidth(sloganText);
        const charSpace = (brandWidth - sloganWidth) / (sloganText.length - 1);
        doc.text(sloganText, 20, 21, { charSpace });

        doc.setFontSize(10);
        doc.text(t('pdf_reservation_confirmation'), 190, 18, { align: 'right' });

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('pdf_device')}:`, 20, 50);
        doc.setFont('helvetica', 'normal');
        doc.text(product.name, 70, 50);

        doc.setFont('helvetica', 'bold');
        doc.text(`${t('pdf_price')}:`, 20, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(`€${product.price}`, 70, 60);

        doc.setFont('helvetica', 'bold');
        doc.text(`${t('pdf_shop')}:`, 20, 70);
        doc.setFont('helvetica', 'normal');
        doc.text(selectedShop.name, 70, 70);

        doc.setFont('helvetica', 'bold');
        doc.text(`${t('pdf_customer')}:`, 20, 90);
        doc.setFont('helvetica', 'normal');
        doc.text(`${name} (${phone})`, 70, 90);

        const pdfBase64 = doc.output('datauristring').split(',')[1];

        // Trigger auto-download
        const safeFileName = `Reservation_${product.name.replace(/\s+/g, '_')}.pdf`;
        doc.save(safeFileName);

        // Send Email to Customer
        sendEmail(
            email,
            t('email_reservation_subject', product.name),
            `<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #4338ca; padding: 30px; text-align: center;">
                    <div style="display: inline-block; text-align: left;">
                        <div style="font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #ffffff; white-space: nowrap; margin-bottom: 2px; line-height: 1;">
                            BELMOBILE<span style="color: #eab308;">.BE</span>
                        </div>
                        <div style="font-size: 10px; font-weight: 700; letter-spacing: 5.1px; text-transform: uppercase; color: #94a3b8; white-space: nowrap; line-height: 1; padding-left: 1px;">
                            BUYBACK & REPAIR
                        </div>
                    </div>
                </div>
                <div style="padding: 30px; line-height: 1.6;">
                    <h2 style="color: #4338ca; margin-top: 0;">${t('email_reservation_title')}</h2>
                    <p>${t('email_reservation_success', product.name, selectedShop.name)}</p>
                    <p>${t('email_buyback_repair_attachment')}</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #666;">${t('email_automatic_message')}</p>
                </div>
                <div style="padding: 20px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 14px; font-weight: bold; color: #1e293b; margin: 0;">Belmobile.be</p>
                    <p style="font-size: 12px; color: #64748b; margin: 4px 0;">Rue Gallait 4, 1030 Schaerbeek, Brussels</p>
                    <p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">
                        &copy; ${new Date().getFullYear()} Belmobile. All rights reserved.
                    </p>
                </div>
             </div>`,
            [{
                filename: `Reservation_${product.name.replace(/\s+/g, '_')}.pdf`,
                content: pdfBase64,
                encoding: 'base64'
            }]
        );

        // Send Email Copy to Admin
        sendEmail(
            'info@belmobile.be',
            `[ADMIN COPY] ${t('email_reservation_subject', product.name)}`,
            `<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #4338ca; padding: 30px; text-align: center;">
                    <div style="display: inline-block; text-align: left;">
                        <div style="font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #ffffff; white-space: nowrap; margin-bottom: 2px; line-height: 1;">
                            BELMOBILE<span style="color: #eab308;">.BE</span>
                        </div>
                        <div style="font-size: 10px; font-weight: 700; letter-spacing: 5.1px; text-transform: uppercase; color: #94a3b8; white-space: nowrap; line-height: 1; padding-left: 1px;">
                            BUYBACK & REPAIR
                        </div>
                    </div>
                </div>
                <div style="padding: 30px; line-height: 1.6;">
                    <h2 style="color: #4338ca; margin-top: 0;">New Reservation Request</h2>
                    <p>A new reservation has been placed by <strong>${name}</strong> (${email}).</p>
                    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p><strong>Device:</strong> ${product.name}</p>
                        <p><strong>Shop:</strong> ${selectedShop.name}</p>
                        <p><strong>Phone:</strong> ${phone}</p>
                    </div>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #666;">This is an administrative copy.</p>
                </div>
                <div style="padding: 20px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 14px; font-weight: bold; color: #1e293b; margin: 0;">Belmobile.be</p>
                    <p style="font-size: 12px; color: #64748b; margin: 4px 0;">Rue Gallait 4, 1030 Schaerbeek, Brussels</p>
                    <p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">
                        &copy; ${new Date().getFullYear()} Belmobile. All rights reserved.
                    </p>
                </div>
             </div>`,
            [{
                filename: `Reservation_${product.name.replace(/\s+/g, '_')}.pdf`,
                content: pdfBase64,
                encoding: 'base64'
            }]
        );

        setSubmitted(true);
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
                            {t('Thank you for your reservation for the {0} at {1}.', product.name, selectedShop?.name || '')}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8 max-w-xs mx-auto">
                            {t('You will receive a confirmation email shortly. You can now close this window.')}
                        </p>
                        <button onClick={onClose} className="bg-bel-blue text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                            {t('Close')}
                        </button>
                    </div>
                ) : !selectedShop ? (
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('Select a Shop')}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('Where would you like to pick up your device?')}</p>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
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
                                                ? 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-bel-blue dark:hover:border-bel-blue hover:shadow-lg hover:-translate-y-1'
                                                : 'border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 opacity-60 cursor-not-allowed'
                                                }`}
                                        >
                                            <div className="mb-4">
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{shop.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">{shop.address}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{shop.city}</p>
                                            </div>

                                            <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100 dark:border-slate-700 w-full">
                                                <div className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${isAvailable
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {isAvailable ? t('In Stock') : t('Out of Stock')}
                                                </div>
                                                {isAvailable && <span className="text-xs font-medium text-gray-400">{t('{0} left', stock)}</span>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('Reserve Item')}</h2>
                                <button
                                    onClick={() => setSelectedShop(null)}
                                    className="text-xs font-bold text-bel-blue hover:underline"
                                >
                                    {t('Change Shop')}
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('You are reserving the {0} at {1}.', product.name, selectedShop?.name || '')}
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <Input
                                label={t('Full Name')}
                                name="name"
                                id="name"
                                required
                                placeholder="John Doe"
                            />
                            <Input
                                label={t('Email Address')}
                                name="email"
                                id="email"
                                type="email"
                                required
                                placeholder="john@example.com"
                            />
                            <Input
                                label={t('Phone Number')}
                                name="phone"
                                id="phone"
                                type="tel"
                                required
                                placeholder="+32 400 00 00 00"
                            />
                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                >
                                    {t('Confirm Reservation')}
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReservationModal;
