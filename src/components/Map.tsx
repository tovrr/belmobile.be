'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shop } from '../types';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { MapPinIcon } from '@heroicons/react/24/outline';

interface MapProps {
    shops: Shop[];
    center: [number, number];
    zoom: number;
    selectedShopId?: number | string | null;
    hoveredShopId?: number | string | null;
    onMarkerClick?: (id: number | string) => void;
}

const Map: React.FC<MapProps> = ({ shops, center, zoom, selectedShopId, hoveredShopId, onMarkerClick }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<{ [key: string]: L.Marker }>({});
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

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
    }, []); // Run once

    // Handle User Location
    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation([latitude, longitude]);

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

            // Custom Marker HTML
            const markerHtml = `
                <div class="relative group transition-all duration-300 ${isSelected || isHovered ? 'z-50 scale-110' : 'z-10 scale-100'}">
                    <div class="
                        flex items-center justify-center 
                        ${isComingSoon
                    ? 'w-8 h-8 bg-gray-100 border-2 border-gray-400 text-gray-500 rounded-full shadow-md'
                    : 'w-10 h-10 bg-bel-blue border-2 border-white text-white rounded-full shadow-lg'
                }
                        ${isSelected ? 'ring-4 ring-bel-blue/30' : ''}
                    ">
                        ${isComingSoon
                    ? '<span class="text-xs font-bold">?</span>'
                    : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>'
                }
                    </div>
                    ${(isSelected || isHovered) ? `
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl">
                            ${shop.name}
                            <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                    ` : ''}
                </div>
            `;

            const icon = L.divIcon({
                className: 'bg-transparent border-none',
                html: markerHtml,
                iconSize: [40, 40],
                iconAnchor: [20, 40] // Bottom center anchor
            });

            const marker = L.marker([shop.coords.lat, shop.coords.lng], { icon })
                .addTo(map)
                .on('click', () => {
                    if (onMarkerClick) onMarkerClick(shop.id);
                    map.flyTo([shop.coords.lat, shop.coords.lng], 14, {
                        duration: 1.2,
                        easeLinearity: 0.25
                    });
                });

            markersRef.current[shop.id] = marker;
        });

    }, [shops, selectedShopId, hoveredShopId, onMarkerClick]);

    // Fly to selected shop
    useEffect(() => {
        if (selectedShopId && mapRef.current) {
            const shop = shops.find(s => s.id === selectedShopId);
            if (shop) {
                mapRef.current.flyTo([shop.coords.lat, shop.coords.lng], 14, {
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
            <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
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

