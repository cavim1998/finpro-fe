'use client';

import React, { useMemo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { OutletListTypes } from '@/types/outlet';
import Link from 'next/link';

interface OutletsMapProps {
    outlets: OutletListTypes[];
    queryString?: string;
}

export default function OutletsMap({ outlets, queryString }: OutletsMapProps) {
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
                            <div className="w-64 h-72 rounded-2xl overflow-hidden shadow-xl relative isolate">
                                {outlet.photoUrl ? (
                                    <img
                                        src={outlet.photoUrl}
                                        alt={outlet.name}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-linear-to-br from-[#1dacbc]/30 to-[#14939e]/30" />
                                )}

                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

                                <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-semibold bg-[#1dacbc] text-white">
                                    {outlet.isActive ? 'Aktif' : 'Nonaktif'}
                                </div>

                                <div className="absolute bottom-0 p-3 text-white w-full space-y-0">
                                    <p className="text-lg font-bold leading-[1.05] line-clamp-2">
                                        {outlet.name}
                                    </p>

                                    {outlet.locationCategory && (
                                        <p className="mt-0.5 text-[11px] leading-[1.05] text-gray-200 font-medium">
                                            {outlet.locationCategory}
                                        </p>
                                    )}

                                    <p className="mt-0 text-[11px] leading-[1.05] text-gray-300 line-clamp-1">
                                        {outlet.addressText}
                                    </p>

                                    <Link
                                        href={`/outlets/${outlet.id}?${queryString || 'page=1&pageSize=12'}`}
                                        className="mt-0.5 block w-full bg-[#1dacbc] text-white! hover:text-white! focus:text-white! py-1.5 rounded-lg font-semibold hover:bg-[#14939e] transition-colors duration-200 text-center"
                                    >
                                        Lihat Detail
                                    </Link>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
