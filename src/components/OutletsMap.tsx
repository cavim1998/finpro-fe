'use client';

import React, { useMemo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { OutletListTypes } from '@/types/outlet';

interface OutletsMapProps {
    outlets: OutletListTypes[];
    loading?: boolean;
}

export default function OutletsMap({ outlets, loading }: OutletsMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    const MapContainer = useMemo(
        () => dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false }),
        []
    );
    const TileLayer = useMemo(
        () => dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false }),
        []
    );
    const Marker = useMemo(
        () => dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false }),
        []
    );
    const Popup = useMemo(
        () => dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false }),
        []
    );

    useEffect(() => {
        setIsMounted(true);
        const setupLeafletIcons = async () => {
            const leaflet = await import('leaflet');
            leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
        };

        setupLeafletIcons();
    }, []);

    if (!isMounted) {
        return (
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Loading map...</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1dacbc]"></div>
            </div>
        );
    }

    // Filter outlets with valid coordinates
    const validOutlets = outlets.filter(
        outlet => outlet.latitude && outlet.longitude && !isNaN(Number(outlet.latitude)) && !isNaN(Number(outlet.longitude))
    );

    if (validOutlets.length === 0) {
        return (
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No outlets with location data available</p>
            </div>
        );
    }

    // Calculate center point (average of all coordinates)
    const centerLat = validOutlets.reduce((sum, o) => sum + Number(o.latitude), 0) / validOutlets.length;
    const centerLng = validOutlets.reduce((sum, o) => sum + Number(o.longitude), 0) / validOutlets.length;

    return (
        <div className="w-full rounded-lg overflow-hidden shadow-md">
            <MapContainer
                center={[centerLat, centerLng]}
                zoom={6}
                style={{ height: '400px', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {validOutlets.map((outlet) => (
                    <Marker
                        key={outlet.id}
                        position={[Number(outlet.latitude), Number(outlet.longitude)]}
                    >
                        <Popup>
                            <div className="p-2 text-sm">
                                <p className="font-bold text-[#1dacbc]">{outlet.name}</p>
                                <p className="text-gray-600 text-xs mt-1">{outlet.addressText}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
