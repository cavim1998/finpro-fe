'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { axiosInstance } from '@/lib/axios';
import { OutletListTypes } from '@/types/outlet';

export default function OutletsPage() {
    const [outlets, setOutlets] = useState<OutletListTypes[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadOutlets();
    }, []);

    const loadOutlets = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/outlets');
            let data = response.data;

            if (data && typeof data === 'object' && 'data' in data) {
                data = data.data;
            }

            const outletArray = Array.isArray(data) ? data : [];
            setOutlets(outletArray);
        } catch (err) {
            console.error('Failed to load outlets:', err);
            const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data outlet. Silakan coba lagi.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f9f9f9]">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#1dacbc] to-[#14939e] text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                        Outlet Kami
                    </h1>
                    <p className="text-lg md:text-xl mt-4 opacity-90">
                        Kunjungi outlet terdekat kami di berbagai kota
                    </p>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="container mx-auto px-4 py-24 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1dacbc] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat outlet...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="container mx-auto px-4 py-12">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-700 font-semibold mb-4">{error}</p>
                        <button
                            onClick={loadOutlets}
                            className="px-6 py-2 bg-[#1dacbc] text-white rounded-lg font-semibold hover:bg-[#14939e] transition"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            )}

            {/* Outlets Grid */}
            {!loading && !error && (
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {outlets.map((outlet) => (
                            <div
                                key={outlet.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                            >
                                <div className="relative h-48 bg-gray-300 overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-[#1dacbc]/20 to-[#14939e]/20 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-6xl mb-2">🏪</div>
                                            <p className="text-gray-600 text-sm">Outlet Image</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-3 right-3 bg-[#1dacbc] text-white px-3 py-1 rounded-full text-xs font-semibold">
                                        {outlet.isActive ? 'Aktif' : 'Tidak Aktif'}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-[#1dacbc] text-lg mb-3">
                                        {outlet.name}
                                    </h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-start gap-2">
                                            <span className="text-lg">📍</span>
                                            <span className="line-clamp-2">{outlet.addressText}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">📏</span>
                                            <span>Radius: {outlet.serviceRadiusKm} km</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">👥</span>
                                            <span>{outlet.staffCount ?? outlet._count?.staff ?? 0} staff</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">📌</span>
                                            <span className="text-xs">
                                                Lat: {parseFloat(outlet.latitude).toFixed(4)},
                                                Lon: {parseFloat(outlet.longitude).toFixed(4)}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="w-full mt-4 bg-[#1dacbc] text-white py-2 rounded-lg font-semibold hover:bg-[#14939e] transition-colors duration-200">
                                        Lihat Detail
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {outlets.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Tidak ada outlet tersedia</p>
                        </div>
                    )}
                </div>
            )}

            <Footer />
        </div>
    );
}
