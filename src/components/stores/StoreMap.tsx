'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shop } from '../../types';

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
                const shopSlug = shop.slugs?.[lang] || shop.id;
                const storePathSegment = {
                    fr: 'magasins',
                    nl: 'winkels',
                    en: 'stores'
                }[lang] || 'stores';

                const url = `/${lang}/${storePathSegment}/${shopSlug}`;

                const marker = L.marker([shop.coords.lat, shop.coords.lng])
                    .addTo(map)
                    .bindPopup(`
                        <div style="font-family: sans-serif; min-width: 200px;">
                            <h3 style="font-weight: bold; margin-bottom: 4px; font-size: 16px;">${shop.name}</h3>
                            <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;">${shop.address}</p>
                            <a href="${url}" style="color: #0066cc; text-decoration: none; font-weight: 500;">
                                View Details &rarr;
                            </a>
                        </div>
                    `);

                markersRef.current.push(marker);
                bounds.extend([shop.coords.lat, shop.coords.lng]);
            }
        });

        if (shops.length > 0 && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [shops, lang]);

    return <div ref={mapContainerRef} className="w-full h-full z-0" />;
};

export default StoreMap;
