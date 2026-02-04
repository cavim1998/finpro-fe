'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { axiosInstance } from '@/lib/axios';
import { OutletListTypes } from '@/types/outlet';
import { FaMapMarkerAlt } from "react-icons/fa";

export default function OutletsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const [outlets, setOutlets] = useState<OutletListTypes[]>([]);
    const [searchInput, setSearchInput] = useState(search);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1,
        page: 1,
        pageSize: 12,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Debounce search input before updating URL
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== search) {
                updateSearchParams({ search: searchInput });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        loadOutlets();
    }, [page, pageSize, search, category]);


    const loadOutlets = async () => {
        try {
            // Cancel previous request if exists
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new abort controller
            abortControllerRef.current = new AbortController();

            setLoading(true);
            setError(null);
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                ...(search && { search }),
                ...(category && { category }),
            });

            const response = await axiosInstance.get(`/outlets?${params.toString()}`, {
                signal: abortControllerRef.current.signal,
            });
            let data = response.data?.data ?? response.data;

            if (data && typeof data === 'object' && 'items' in data) {
                const items = Array.isArray(data.items) ? data.items : [];
                setOutlets(items);
                setPagination({
                    total: Number(data.total || items.length),
                    totalPages: Number(data.totalPages || 1),
                    page: Number(data.page || page),
                    pageSize: Number(data.pageSize || pageSize),
                });
            } else {
                const outletArray = Array.isArray(data) ? data : [];
                setOutlets(outletArray);
                setPagination({
                    total: outletArray.length,
                    totalPages: 1,
                    page,
                    pageSize,
                });
            }
        } catch (err: any) {
            // Ignore abort errors
            if (err.name === 'AbortError' || err.name === 'CanceledError') {
                return;
            }
            console.error('Failed to load outlets:', err);
            const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data outlet. Silakan coba lagi.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const updateSearchParams = (newParams: Record<string, string | number | boolean>) => {
        const nextParams = new URLSearchParams(searchParams);

        Object.entries(newParams).forEach(([key, value]) => {
            if (value === '' || value === false || value === undefined) {
                nextParams.delete(key);
            } else {
                nextParams.set(key, String(value));
            }
        });

        if (newParams.search || newParams.pageSize) {
            nextParams.set('page', '1');
        }

        router.replace(`?${nextParams.toString()}`, { scroll: false });
    };

    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
    };

    const handleCategoryChange = (value: string) => {
        updateSearchParams({ category: value });
    };

    const handlePageSizeChange = (value: number) => {
        updateSearchParams({ pageSize: value });
    };

    const handlePageChange = (value: number) => {
        updateSearchParams({ page: value });
    };

    return (
        <div className="min-h-screen bg-[#f9f9f9]">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-linear-to-r from-[#1dacbc] to-[#14939e] text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                        Our Outlets
                    </h1>
                    <p className="text-lg md:text-xl mt-4 opacity-90">
                        Visit our nearest outlets in various cities
                    </p>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="container mx-auto px-4 py-24 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1dacbc] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
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
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Outlets Grid */}
            {!loading && !error && (
                <div className="container mx-auto px-4 py-12">
                    {/* Controls */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search outlets..."
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-400 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                            <select
                                value={category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1dacbc]"
                            >
                                <option value="">All Locations</option>
                                <option value="jakarta">Jakarta</option>
                                <option value="bandung">Bandung</option>
                                <option value="surabaya">Surabaya</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Items per page</label>
                            <select
                                value={pageSize}
                                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1dacbc]"
                            >
                                <option value={6}>6</option>
                                <option value={12}>12</option>
                                <option value={24}>24</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {outlets.map((outlet) => (
                            <div
                                key={outlet.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                            >
                                <div className="relative h-48 bg-gray-300 overflow-hidden">
                                    <div className="w-full h-full bg-linear-to-br from-[#1dacbc]/20 to-[#14939e]/20 flex items-center justify-center">
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
                                            <FaMapMarkerAlt className="text-lg" />
                                            <span className="line-clamp-2">{outlet.addressText}</span>
                                        </div>
                                    </div>
                                    <div className='flex gap-2'>
                                        <Link
                                            href={`/outlets/${outlet.id}?${searchParams.toString() || 'page=1&pageSize=12'}`}
                                            className="w-full mt-4 bg-[#1dacbc] text-white py-2 rounded-lg font-semibold hover:bg-[#14939e] transition-colors duration-200 text-center"
                                        >
                                            Details
                                        </Link>
                                        <button className="w-full mt-4 bg-[#1dacbc] text-white py-2 rounded-lg font-semibold hover:bg-[#14939e] transition-colors duration-200">
                                            Contact Outlet
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {outlets.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No outlets available</p>
                        </div>
                    )}

                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>

                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => handlePageChange(p)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                        page === p
                                            ? 'bg-[#1dacbc] text-white'
                                            : 'border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= pagination.totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    <div className="text-center mt-6 text-sm text-gray-500">
                        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, pagination.total)} of {pagination.total} outlets
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
