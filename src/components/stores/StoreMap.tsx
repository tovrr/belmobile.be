'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shop } from '../../types';
import { translations } from '../../utils/translations';

// Fix for default marker icons in Next.js/Leaflet
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

interface StoreMapProps {
    shops: Shop[];
    lang: string;
}

const StoreMap: React.FC<StoreMapProps> = ({ shops, lang }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        // Initialize map centered on Brussels
        const map = L.map(mapContainerRef.current).setView([50.8503, 4.3517], 12);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Configure default icon
        const DefaultIcon = L.icon({
            iconUrl,
            iconRetinaUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        L.Marker.prototype.options.icon = DefaultIcon;

        // Force a resize calculation after a short delay to ensure correct rendering
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, []);

    // Update markers when shops change
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        const map = mapInstanceRef.current;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        const bounds = L.latLngBounds([]);

        shops.forEach(shop => {
            if (shop.coords) {
                const shopSlug = shop.slugs?.[lang as keyof typeof shop.slugs] || shop.id;
                const storePathSegment = {
                    fr: 'magasins',
                    nl: 'winkels',
                    en: 'stores'
                }[lang as 'en' | 'fr' | 'nl'] || 'stores';

                const url = `/${lang}/${storePathSegment}/${shopSlug}`;

                const viewDetailsText = translations[lang as keyof typeof translations]?.['View Details'] || 'View Details';

                // Use the same pointer-style marker as the main Map component
                const markerHtml = `
                    <div class="relative flex flex-col items-center transition-all duration-300 scale-100">
                        <div class="flex items-center justify-center w-10 h-10 bg-bel-blue border-2 border-white text-white rounded-full shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                        </div>
                        <div class="-mt-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-8 border-t-bel-blue relative z-0"></div>
                    </div>
                `;

                const icon = L.divIcon({
                    className: 'bg-transparent border-none',
                    html: markerHtml,
                    iconSize: [40, 42],
                    iconAnchor: [20, 42]
                });

                const marker = L.marker([shop.coords.lat, shop.coords.lng], { icon })
                    .addTo(map)
                    .bindPopup(`
                        <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
                            <h3 style="font-weight: bold; margin-bottom: 4px; font-size: 16px; color: #1e293b;">${shop.name}</h3>
                            <p style="margin: 0 0 12px 0; color: #475569; font-size: 13px;">${shop.address}</p>
                             <a href="${url}" style="display: inline-block; background: #0066cc; color: white; padding: 6px 12px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 12px;">
                                ${viewDetailsText} &rarr;
                            </a>
                        </div>
                    `);

                markersRef.current.push(marker);
                bounds.extend([shop.coords.lat, shop.coords.lng]);
            }
        });

        // "Zoom map on Brussels when first loading"
        // If we have shops, instead of a loose fitBounds, we force a closer view on Brussels center
        if (bounds.isValid()) {
            map.setView([50.8503, 4.3517], 13);
        }
    }, [shops, lang]);

    return <div ref={mapContainerRef} className="w-full h-full z-0" />;
};

export default StoreMap;
