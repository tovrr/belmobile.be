'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shop } from '../../types/models';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

export interface MapProps {
    shops: Shop[];
    center?: [number, number];
    zoom?: number;
    lang?: string;
    selectedShopId?: number | string | null;
    hoveredShopId?: number | string | null;
    onMarkerClick?: (id: number | string) => void;
    className?: string;
}

const Map: React.FC<MapProps> = ({
    shops,
    center = [50.8503, 4.3517],
    zoom = 12,
    lang = 'fr',
    selectedShopId,
    hoveredShopId,
    onMarkerClick
}) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<{ [key: string]: L.Marker }>({});

    // Initialize Map
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            // Create map instance
            mapRef.current = L.map(mapContainerRef.current, {
                zoomControl: false, // We'll add it manually for better positioning
                attributionControl: false
            }).setView(center, zoom);

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapRef.current);

            // Add Zoom Control to bottom right
            L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
        }
    }, []); // Only run once on mount

    // Update View when center/zoom changes
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.flyTo(center, zoom, {
                duration: 1.5
            });
        }
    }, [center, zoom]);

    // Handle User Location
    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                if (mapRef.current) {
                    mapRef.current.flyTo([latitude, longitude], 13, {
                        duration: 1.5
                    });

                    // Add User Marker
                    const userIcon = L.divIcon({
                        className: 'custom-user-marker',
                        html: `<div class="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg relative">
                                <div class="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
                               </div>`,
                        iconSize: [16, 16],
                        iconAnchor: [8, 8]
                    });

                    L.marker([latitude, longitude], { icon: userIcon, title: "You are here" }).addTo(mapRef.current);
                }
            },
            () => {
                alert("Unable to retrieve your location");
            }
        );
    };

    // Update Markers & View
    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current;

        // Clear existing markers not in current set (if any) or update all
        // For simplicity, we remove all and re-add to handle state changes cleanly
        Object.values(markersRef.current).forEach((marker) => (marker as L.Marker).remove());
        markersRef.current = {};

        shops.forEach(shop => {
            const isSelected = selectedShopId === shop.id;
            const isHovered = hoveredShopId === shop.id;
            const isComingSoon = shop.status === 'coming_soon';

            // Custom Marker HTML (Pointer style)
            const markerHtml = `
                <div class="relative flex flex-col items-center transition-all duration-300 ${isSelected || isHovered ? 'z-50 scale-110' : 'z-10 scale-100'}">
                    <div class="
                        flex items-center justify-center 
                        ${isComingSoon
                    ? 'w-10 h-10 bg-gray-100 border-2 border-gray-400 text-gray-500 rounded-full shadow-md'
                    : 'w-10 h-10 bg-bel-blue border-2 border-white text-white rounded-full shadow-lg'
                }
                        ${isSelected ? 'ring-4 ring-bel-blue/30' : ''}
                    ">
                        ${isComingSoon
                    ? '<span class="text-xs font-bold font-sans">?</span>'
                    : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>'
                }
                    </div>
                    <!-- Pointer Tip -->
                    <div class="-mt-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-8 ${isComingSoon ? 'border-t-gray-400' : 'border-t-bel-blue'} relative z-0"></div>
                    
                    ${(isSelected || isHovered) ? `
                        <div class="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xl backdrop-blur-md">
                            ${shop.name}
                            <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                        </div>
                    ` : ''}
                </div>
            `;

            const icon = L.divIcon({
                className: 'bg-transparent border-none',
                html: markerHtml,
                iconSize: [40, 42],
                iconAnchor: [20, 42] // Precision anchor at the very tip
            });

            const lat = shop.coords?.lat || 0;
            const lng = shop.coords?.lng || 0;

            const marker = L.marker([lat, lng], { icon })
                .addTo(map)
                .on('click', () => {
                    if (onMarkerClick) onMarkerClick(shop.id);
                    const lat2 = shop.coords?.lat || 0;
                    const lng2 = shop.coords?.lng || 0;
                    map.flyTo([lat2, lng2], 14, {
                        duration: 1.2,
                        easeLinearity: 0.25
                    });
                });

            // Re-adding popup logic if needed (e.g. for simple store pages)
            if ((shop as any).showPopup || true) { // Defaulting to true for now to restore functionality
                const shopSlug = shop.slugs?.[lang as keyof typeof shop.slugs] || shop.id;
                const storePathSegment = {
                    fr: 'magasins',
                    nl: 'winkels',
                    en: 'stores'
                }[lang as 'en' | 'fr' | 'nl'] || 'stores';

                const url = `/${lang}/${storePathSegment}/${shopSlug}`;

                marker.bindPopup(`
                    <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
                        <h3 style="font-weight: bold; margin-bottom: 4px; font-size: 16px; color: #1e293b;">${shop.name}</h3>
                        <p style="margin: 0 0 12px 0; color: #475569; font-size: 13px;">${shop.address}</p>
                        <a href="${url}" style="display: inline-block; background: #0066cc; color: white; padding: 6px 12px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 12px;">
                            ${lang === 'nl' ? 'Details bekijken' : lang === 'en' ? 'View Details' : 'Voir les détails'} &rarr;
                        </a>
                    </div>
                `, {
                    className: 'custom-leaflet-popup'
                });
            }

            markersRef.current[shop.id] = marker;
        });

    }, [shops, selectedShopId, hoveredShopId, onMarkerClick]);

    // Fly to selected shop
    useEffect(() => {
        if (selectedShopId && mapRef.current) {
            const shop = shops.find(s => s.id === selectedShopId);
            if (shop) {
                const lat = shop.coords?.lat || 0;
                const lng = shop.coords?.lng || 0;
                mapRef.current.flyTo([lat, lng], 14, {
                    duration: 1.5
                });
            }
        }
    }, [selectedShopId, shops]);

    return (
        <div className="w-full h-full relative">
            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Floating Actions */}
            <div className="absolute top-4 right-4 z-400 flex flex-col gap-2">
                <button
                    onClick={handleUseLocation}
                    className="bg-white dark:bg-slate-800 text-bel-dark dark:text-white p-3 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group"
                    title="Use my location"
                >
                    <PaperAirplaneIcon className="h-5 w-5 group-hover:text-bel-blue transition-colors" />
                </button>
            </div>
        </div>
    );
};

export default Map;

