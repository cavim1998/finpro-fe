'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import { MapPin, Phone, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { FaCircleChevronLeft } from "react-icons/fa6";
import dynamic from 'next/dynamic';

interface OutletDetail {
    id: number;
    name: string;
    addressText: string;
    createdAt?: string;
    latitude: string;
    longitude: string;
    locationCategory?: string | null;
    photoUrl?: string | null;
    phone?: string;
    operatingHours?: string;
}

export default function OutletDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const outletId = params.id as string;
    const query = searchParams.toString();

    const [outlet, setOutlet] = useState<OutletDetail | null>(null);
    const [loading, setLoading] = useState(true);

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
        loadOutletDetail();
    }, [outletId, query]);

    useEffect(() => {
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

    const loadOutletDetail = async () => {
        try {
            setLoading(true);
            const url = query ? `/outlets/${outletId}?${query}` : `/outlets/${outletId}`;
            const response = await axiosInstance.get(url);
            const data = response.data?.data || response.data;
            setOutlet(data);
        } catch (error) {
            console.error('Failed to load outlet detail:', error);
            toast.error('Failed to load outlet details');
        } finally {
            setLoading(false);
        }
    };

    if (!outlet && !loading) {
        return (
            <div className="min-h-screen bg-[#f9f9f9]">
                <Navbar />
                <div className="container mx-auto px-4 py-20 text-center">
                    <p className="text-gray-500 text-lg">Outlet not found</p>
                    <Link href="/outlets" className="text-[#1dacbc] hover:underline mt-4 inline-block">
                        <FaCircleChevronLeft /> Back to Outlets
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f9f9f9]">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-[#1dacbc] animate-spin mb-4" />
                    <p className="text-gray-500">Loading outlet details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    const latitude = outlet ? Number(outlet.latitude) : null;
    const longitude = outlet ? Number(outlet.longitude) : null;
    const hasValidCoords = Number.isFinite(latitude) && Number.isFinite(longitude);
    const createdAtText = outlet?.createdAt
        ? new Date(outlet.createdAt).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          })
        : null;

    return (
        <div className="min-h-screen bg-[#f9f9f9]">
            <Navbar />

            {/* Back Button */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/outlets" className="text-[#1dacbc] text-lg hover:underline flex items-center gap-2">
                        <FaCircleChevronLeft /> Back to Outlets
                    </Link>
                </div>
            </div>

            {/* Outlet Detail */}
            {outlet && (
                <div className="bg-[#f9f9f9]">
                    <div className="container mx-auto px-4 py-12">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <div className="flex flex-col lg:flex-row lg:items-start gap-10">
                                <div className="w-full lg:w-[55%]">
                                    {outlet.photoUrl && (
                                        <div className="rounded-2xl overflow-hidden h-64 md:h-72 bg-gray-100 mb-6">
                                            <img
                                                src={outlet.photoUrl}
                                                alt={outlet.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="rounded-2xl overflow-hidden h-80 md:h-[460px] bg-gray-100">
                                        {hasValidCoords ? (
                                            <MapContainer
                                                center={[latitude as number, longitude as number]}
                                                zoom={15}
                                                scrollWheelZoom={false}
                                                className="h-full w-full"
                                            >
                                                <TileLayer
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                    attribution="&copy; OpenStreetMap contributors"
                                                />
                                                <Marker position={[latitude as number, longitude as number]}>
                                                    <Popup>{outlet.name}</Popup>
                                                </Marker>
                                            </MapContainer>
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
                                                Koordinat outlet tidak tersedia
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full lg:w-[45%]">
                                    <p className="text-sm font-semibold text-[#1dacbc] tracking-wide">Outlet Detail</p>
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                                        {outlet.name}
                                    </h1>

                                    {outlet.locationCategory && (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e6f4f6] text-[#1dacbc] mt-3">
                                            {outlet.locationCategory}
                                        </span>
                                    )}

                                    <div className="flex items-start gap-3 mt-4 text-gray-600">
                                        <MapPin className="w-5 h-5 text-[#1dacbc] flex-shrink-0 mt-0.5" />
                                        <p className="text-base md:text-lg">{outlet.addressText}</p>
                                    </div>

                                    {createdAtText && (
                                        <div className="mt-3 text-sm text-gray-600">
                                            Created: {createdAtText}
                                        </div>
                                    )}

                                    <div className="mt-6 space-y-3">
                                        {outlet.phone && (
                                            <div className="flex items-start gap-3 text-gray-700">
                                                <Phone className="w-5 h-5 text-[#1dacbc] flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500">Phone</p>
                                                    <p className="text-base">{outlet.phone}</p>
                                                </div>
                                            </div>
                                        )}

                                        {outlet.operatingHours && (
                                            <div className="flex items-start gap-3 text-gray-700">
                                                <Clock className="w-5 h-5 text-[#1dacbc] flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500">Operating Hours</p>
                                                    <p className="text-base">{outlet.operatingHours}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
