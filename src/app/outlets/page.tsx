'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { axiosInstance } from '@/lib/axios';
import { OutletListTypes } from '@/types/outlet';
import { FaMapMarkerAlt } from "react-icons/fa";
import OutletsMap from '@/components/OutletsMap';
import { Loader2 } from 'lucide-react';

export default function OutletsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const search = searchParams.get('search') || '';
    const locationCategory = searchParams.get('locationCategory') || '';

    const [outlets, setOutlets] = useState<OutletListTypes[]>([]);
    const [allOutlets, setAllOutlets] = useState<OutletListTypes[]>([]); // Store all outlets for client-side pagination
    const [searchInput, setSearchInput] = useState(search);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1,
        page: 1,
        pageSize: 12,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allCategories, setAllCategories] = useState<string[]>([]);
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
    }, [page, pageSize, search, locationCategory]);

    // Load all categories once on mount (without filters)
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await axiosInstance.get('/outlets?pageSize=100');
                const data = response.data?.data ?? response.data;
                const items = data?.items ?? data;

                if (Array.isArray(items)) {
                    const categories = items
                        .map((outlet: OutletListTypes) => outlet.locationCategory)
                        .filter((value): value is string => {
                            return value !== null && value !== undefined && value.trim().length > 0;
                        })
                        .map((value) => value.trim());

                    setAllCategories(Array.from(new Set(categories)));
                }
            } catch (err) {
                console.error('Failed to load categories:', err);
            }
        };

        loadCategories();
    }, []);


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

            console.log('[Outlets] Fetching with client-side pagination:', {
                page,
                pageSize,
                search,
                locationCategory,
            });

            // Backend doesn't respect pagination params, fetch all and paginate client-side
            const fetchParams = new URLSearchParams({
                ...(search && { search }),
                ...(locationCategory && { locationCategory }),
            });

            const response = await axiosInstance.get(`/outlets?${fetchParams.toString()}`, {
                signal: abortControllerRef.current.signal,
            });
            let data = response.data?.data ?? response.data;

            console.log('[Outlets] Response data:', data);

            // Handle both paginated response and plain array
            let allItems: OutletListTypes[] = [];
            if (data && typeof data === 'object' && 'items' in data) {
                allItems = Array.isArray(data.items) ? data.items : [];
            } else {
                allItems = Array.isArray(data) ? data : [];
            }

            console.log('[Outlets] Total items from backend:', allItems.length);

            // Store all outlets
            setAllOutlets(allItems);

            // Client-side pagination
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedItems = allItems.slice(startIndex, endIndex);
            const totalPages = Math.ceil(allItems.length / pageSize);

            console.log('[Outlets] Client-side pagination:', {
                totalItems: allItems.length,
                page,
                pageSize,
                startIndex,
                endIndex,
                displayingItems: paginatedItems.length,
                totalPages
            });

            setOutlets(paginatedItems);
            setPagination({
                total: allItems.length,
                totalPages: totalPages,
                page: page,
                pageSize: pageSize,
            });
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

        // Reset page to 1 when filters change
        if (
            (newParams.search !== undefined &&
                Object.prototype.hasOwnProperty.call(newParams, 'search')) ||
            (newParams.locationCategory !== undefined &&
                Object.prototype.hasOwnProperty.call(newParams, 'locationCategory')) ||
            (newParams.pageSize !== undefined &&
                Object.prototype.hasOwnProperty.call(newParams, 'pageSize'))
        ) {
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

    const handleLocationCategoryChange = (value: string) => {
        updateSearchParams({ locationCategory: value });
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
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-[#1dacbc] animate-spin mb-4" />
                    <p className="text-gray-500">Loading...</p>
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
                    {/* Map Section */}
                    <div className="mb-12">
                        <OutletsMap outlets={outlets} loading={loading} />
                        {locationCategory && outlets.length === 0 && (
                            <div className="mt-4 text-center text-gray-500 text-sm">
                                Tidak ada outlet dengan kategori "{locationCategory}"
                            </div>
                        )}
                    </div>

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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1dacbc]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Location Category</label>
                            <select
                                value={locationCategory}
                                onChange={(e) => handleLocationCategoryChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1dacbc]"
                            >
                                <option value="">All Locations</option>
                                {allCategories.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Items per page</label>
                            <select
                                value={pageSize.toString()}
                                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1dacbc]"
                            >
                                <option value="6">6</option>
                                <option value="9">9</option>
                                <option value="12">12</option>
                            </select>
                        </div>
                    </div>

                    {/* Results info */}
                    {outlets.length > 0 && (
                        <div className="mb-4 text-sm text-gray-600 flex justify-between items-center">
                            <span>
                                Menampilkan {outlets.length} outlet dari total {pagination.total} outlet
                            </span>
                            <span className="text-xs text-gray-500">
                                Halaman {page} dari {pagination.totalPages}
                            </span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {outlets.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">🏪</div>
                                <p className="text-gray-600 font-semibold">Tidak ada outlet ditemukan</p>
                                {locationCategory && (
                                    <p className="text-gray-500 text-sm mt-2">
                                        Tidak ada outlet dengan kategori "{locationCategory}"
                                    </p>
                                )}
                            </div>
                        )}
                        {outlets.map((outlet) => (
                            <div
                                key={outlet.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                            >
                                <div className="relative h-48 bg-gray-300 overflow-hidden">
                                    {outlet.photoUrl ? (
                                        <img
                                            src={outlet.photoUrl}
                                            alt={outlet.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-linear-to-br from-[#1dacbc]/20 to-[#14939e]/20 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-6xl mb-2">🏪</div>
                                                <p className="text-gray-600 text-sm">Outlet Image</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-[#1dacbc] text-white px-3 py-1 rounded-full text-xs font-semibold">
                                        {outlet.isActive ? 'Aktif' : 'Tidak Aktif'}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-[#1dacbc] text-lg mb-3">
                                        {outlet.name}
                                    </h3>
                                    {outlet.locationCategory && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-[#e6f4f6] text-[#1dacbc] mb-3">
                                            {outlet.locationCategory}
                                        </span>
                                    )}
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
                                    className={`px-3 py-2 rounded-lg text-sm font-medium ${page === p
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
