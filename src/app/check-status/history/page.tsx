'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { axiosInstance } from '@/lib/axios';
import Cookies from 'js-cookie';
import { formatRupiah } from '@/lib/currency';
import { IoRefresh, IoCaretDown } from 'react-icons/io5';

interface PickupRequestListItem {
    id: string;
    customerId?: number;
    outletId?: number;
    outletName?: string;
    distanceKm?: number;
    status: string;
    scheduledPickupAt: string;
    notes?: string;
    createdAt: string;
    arrivedAt?: string;
    outlet?: {
        id: number;
        name: string;
        address?: string;
    };
    order?: {
        id: string;
        orderNo: string;
        status: string;
        totalAmount: string | number;
    };
}

interface OrderListItem {
    id: string;
    orderNumber?: string;
    orderNo?: string;
    status: string;
    totalAmount: number;
    itemsCount?: number;
    outletName?: string;
    createdAt: string;
    deliveryDate?: string;
    deliveredAt?: string;
    receivedConfirmedAt?: string;
    isPaid?: boolean;
}

interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export default function CheckStatusHistoryPage() {
    const router = useRouter();
    const [showAccountSection, setShowAccountSection] = useState(false);
    const [activeTab, setActiveTab] = useState<'pickups' | 'orders'>('pickups');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const userCookie = Cookies.get('user_data');
        if (!userCookie) {
            return;
        }
        setShowAccountSection(true);
    }, []);

    // Fetch pickup requests with infinite query
    const {
        data: pickupData,
        fetchNextPage: fetchNextPickups,
        hasNextPage: hasNextPickups,
        isFetchingNextPage: isFetchingNextPickups,
        isLoading: isLoadingPickups,
        refetch: refetchPickups,
    } = useInfiniteQuery<PaginatedResponse<PickupRequestListItem>>({
        queryKey: ['pickup-history', { filterDateFrom, filterDateTo }],
        queryFn: async ({ pageParam = 1 }) => {
            const params: any = { page: pageParam, limit: 10 };
            if (filterDateFrom) params.dateFrom = filterDateFrom;
            if (filterDateTo) params.dateTo = filterDateTo;
            const response = await axiosInstance.get('/pickup-requests', { params });
            const responseData = response?.data ?? {};
            const data = responseData.data ?? [];
            const meta = responseData.meta ?? responseData.pagination ?? { total: 0, page: pageParam, limit: 10, totalPages: 1 };
            return { data, meta };
        },
        getNextPageParam: (lastPage) => {
            const meta = lastPage?.meta;
            if (!meta || meta.page >= meta.totalPages) {
                return undefined;
            }
            return meta.page + 1;
        },
        initialPageParam: 1,
        enabled: showAccountSection,
    });

    // Fetch orders by fetching pickup requests with orders, then fetch each order
    const {
        data: ordersData,
        fetchNextPage: fetchNextOrders,
        hasNextPage: hasNextOrders,
        isFetchingNextPage: isFetchingNextOrders,
        isLoading: isLoadingOrders,
        refetch: refetchOrders,
    } = useInfiniteQuery<PaginatedResponse<OrderListItem>>({
        queryKey: ['orders-history', { filterDateFrom, filterDateTo }],
        queryFn: async ({ pageParam = 1 }) => {
            // Step 1: Fetch pickups with orders
            const pickupParams: any = { page: pageParam, limit: 20 };
            if (filterDateFrom) pickupParams.dateFrom = filterDateFrom;
            if (filterDateTo) pickupParams.dateTo = filterDateTo;

            const pickupResponse = await axiosInstance.get('/pickup-requests', { params: pickupParams });
            const pickupData = pickupResponse?.data?.data ?? [];

            // Step 2: Filter pickups yang ARRIVED_OUTLET dan punya order
            const pickupsWithOrders = Array.isArray(pickupData)
                ? pickupData.filter((p: any) => p.status === 'ARRIVED_OUTLET' && p.order?.id)
                : [];

            // Step 3: Fetch each order detail
            const orderIds = pickupsWithOrders.map((p: any) => p.order.id);
            const orders: OrderListItem[] = [];

            for (const orderId of orderIds) {
                try {
                    const orderResponse = await axiosInstance.get(`/orders/${orderId}`);
                    const orderData = orderResponse?.data?.data;
                    if (orderData) {
                        orders.push({
                            ...orderData,
                            orderNumber: orderData.orderNumber || orderData.orderNo || orderData.id,
                            status: orderData.orderStatus || orderData.status,
                            deliveryDate: orderData.deliveryDate || orderData.deliveredAt,
                            isPaid: orderData.isPaid ?? false,
                        });
                    }
                } catch (error) {
                    console.error(`Failed to fetch order ${orderId}:`, error);
                }
            }

            // Sort orders by createdAt descending (newest first)
            const sortedOrders = orders.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            // Step 4: Return with meta from pickup response
            const pickupMeta = pickupResponse?.data?.meta ?? pickupResponse?.data?.pagination;
            return {
                data: sortedOrders,
                meta: pickupMeta ?? { total: sortedOrders.length, page: pageParam, limit: 20, totalPages: 1 },
            };
        },
        getNextPageParam: (lastPage) => {
            const meta = lastPage?.meta;
            if (!meta || meta.page >= meta.totalPages) {
                return undefined;
            }
            return meta.page + 1;
        },
        initialPageParam: 1,
        enabled: showAccountSection,
    });

    // Intersection observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    if (activeTab === 'pickups' && hasNextPickups && !isFetchingNextPickups) {
                        fetchNextPickups();
                    } else if (activeTab === 'orders' && hasNextOrders && !isFetchingNextOrders) {
                        fetchNextOrders();
                    }
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [activeTab, hasNextPickups, hasNextOrders, isFetchingNextPickups, isFetchingNextOrders, fetchNextPickups, fetchNextOrders]);

    const handleApplyFilter = () => {
        if (activeTab === 'pickups') {
            refetchPickups();
        } else {
            refetchOrders();
        }
    };

    const handleClearFilter = () => {
        setFilterDateFrom('');
        setFilterDateTo('');
    };

    const formatStatusLabel = (status?: string) => {
        if (!status) return '-';
        return status.replace(/_/g, ' ');
    };

    const formatDateTime = (iso?: string) => {
        if (!iso) return '-';
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const getPickupRequestStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'WAITING_DRIVER':
                return 'bg-yellow-50 text-yellow-700 border border-yellow-300';
            case 'ARRIVED_OUTLET':
                return 'bg-green-50 text-green-700 border border-green-300';
            case 'CANCELED':
                return 'bg-red-50 text-red-700 border border-red-300';
            default:
                return 'bg-gray-50 text-gray-700 border border-gray-300';
        }
    };

    const getOrderStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'WAITING_DRIVER_PICKUP':
                return 'bg-yellow-50 text-yellow-700 border border-yellow-300';
            case 'ON_THE_WAY_TO_OUTLET':
                return 'bg-orange-50 text-orange-700 border border-orange-300';
            case 'ARRIVED_AT_OUTLET':
                return 'bg-blue-50 text-blue-700 border border-blue-300';
            case 'WASHING':
                return 'bg-indigo-50 text-indigo-700 border border-indigo-300';
            case 'IRONING':
                return 'bg-pink-50 text-pink-700 border border-pink-300';
            case 'PACKING':
                return 'bg-purple-50 text-purple-700 border border-purple-300';
            case 'WAITING_PAYMENT':
                return 'bg-amber-50 text-amber-700 border border-amber-300';
            case 'READY_TO_DELIVER':
                return 'bg-cyan-50 text-cyan-700 border border-cyan-300';
            case 'DELIVERING_TO_CUSTOMER':
                return 'bg-teal-50 text-teal-700 border border-teal-300';
            case 'RECEIVED_BY_CUSTOMER':
                return 'bg-green-50 text-green-700 border border-green-300';
            case 'CANCELED':
                return 'bg-red-50 text-red-700 border border-red-300';
            default:
                return 'bg-gray-50 text-gray-700 border border-gray-300';
        }
    };

    // Merge pages and sort by createdAt descending (newest first)
    const pickupRequests = (pickupData?.pages.flatMap((page) => page.data) ?? [])
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const orders = (ordersData?.pages.flatMap((page) => page.data) ?? [])
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

            {/* Main Content */}
            <div className="grow">
                {/* Hero Section */}
                <div className="bg-linear-to-r from-[#1dacbc] to-[#14939e] text-white py-10">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold">Order & Pickup History</h1>
                                <p className="text-teal-50 text-sm mt-1">View your complete order and pickup tracking history</p>
                            </div>
                            <button
                                onClick={() => router.back()}
                                className="px-4 py-2 bg-white text-[#1dacbc] rounded-md font-semibold hover:bg-gray-100 transition"
                            >
                                ← Back
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 py-10">
                    {!showAccountSection ? (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <p className="text-gray-500 text-lg">Sign in to view your history</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            {/* Filter Section */}
                            <div className="mb-6 pb-6 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Filters</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-gray-700 text-xs font-semibold mb-1">From Date</label>
                                        <input
                                            type="date"
                                            value={filterDateFrom}
                                            onChange={(e) => setFilterDateFrom(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1dacbc] focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-xs font-semibold mb-1">To Date</label>
                                        <input
                                            type="date"
                                            value={filterDateTo}
                                            onChange={(e) => setFilterDateTo(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1dacbc] focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <button
                                            onClick={handleApplyFilter}
                                            className="flex-1 px-3 py-2 text-sm bg-[#1dacbc] text-white rounded-md hover:bg-[#14939e] transition font-semibold"
                                        >
                                            Apply Filter
                                        </button>
                                        {(filterDateFrom || filterDateTo) && (
                                            <button
                                                onClick={handleClearFilter}
                                                className="px-3 py-2 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition font-semibold"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="mb-6">
                                <div className="flex gap-4 border-b border-gray-200">
                                    <button
                                        onClick={() => setActiveTab('pickups')}
                                        className={`px-4 py-3 font-semibold text-sm transition border-b-2 ${
                                            activeTab === 'pickups'
                                                ? 'text-[#1dacbc] border-[#1dacbc]'
                                                : 'text-gray-600 border-transparent hover:text-gray-800'
                                        }`}
                                    >
                                        📍 Pickup Requests {pickupData?.pages?.[0]?.meta?.total ? `(${pickupData.pages[0].meta.total})` : ''}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className={`px-4 py-3 font-semibold text-sm transition border-b-2 ${
                                            activeTab === 'orders'
                                                ? 'text-[#1dacbc] border-[#1dacbc]'
                                                : 'text-gray-600 border-transparent hover:text-gray-800'
                                        }`}
                                    >
                                        📦 Orders {ordersData?.pages?.[0]?.meta?.total ? `(${ordersData.pages[0].meta.total})` : ''}
                                    </button>
                                </div>
                            </div>

                            {/* Pickup Requests Tab */}
                            {activeTab === 'pickups' && (
                                <div className="space-y-3">
                                    {isLoadingPickups ? (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500">Loading pickup requests...</p>
                                        </div>
                                    ) : pickupRequests.length === 0 ? (
                                        <div className="text-center py-12">
                                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                            <p className="text-gray-500 text-lg">No pickup requests found</p>
                                        </div>
                                    ) : (
                                        <>
                                            {pickupRequests.map((request) => (
                                                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Pickup ID</p>
                                                            <p className="text-sm font-semibold text-gray-800 truncate">{request.id}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Status</p>
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded inline-block ${getPickupRequestStatusColor(request.status)}`}>
                                                                {formatStatusLabel(request.status)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Scheduled</p>
                                                            <p className="text-sm font-medium text-gray-800">{formatDateTime(request.scheduledPickupAt)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Created</p>
                                                            <p className="text-sm font-medium text-gray-800">{formatDateTime(request.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                    {(request.outletName || request.distanceKm || request.notes) && (
                                                        <div className="text-xs text-gray-600 space-y-1 border-t border-gray-100 pt-3">
                                                            {request.outletName && <p><span className="font-medium">Outlet:</span> {request.outletName}</p>}
                                                            {request.distanceKm && <p><span className="font-medium">Distance:</span> {Number(request.distanceKm).toFixed(2)} km</p>}
                                                            {request.notes && <p><span className="font-medium">Notes:</span> {request.notes}</p>}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {(isFetchingNextPickups || hasNextPickups) && <div ref={observerTarget} className="py-4 text-center" />}
                                            {isFetchingNextPickups && (
                                                <div className="text-center py-4">
                                                    <p className="text-gray-500 text-sm">Loading more...</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Orders Tab */}
                            {activeTab === 'orders' && (
                                <div className="space-y-3">
                                    {isLoadingOrders ? (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500">Loading orders...</p>
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-12">
                                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            <p className="text-gray-500 text-lg">No orders found</p>
                                        </div>
                                    ) : (
                                        <>
                                            {orders.map((orderItem) => (
                                                <div key={orderItem.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Order Number</p>
                                                            <p className="text-sm font-semibold text-gray-800 truncate">{orderItem.orderNumber}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Amount</p>
                                                            <p className="text-sm font-semibold text-[#1dacbc]">{formatRupiah(orderItem.totalAmount)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Status</p>
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded inline-block ${getOrderStatusColor(orderItem.status)}`}>
                                                                {formatStatusLabel(orderItem.status)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Date</p>
                                                            <p className="text-sm font-medium text-gray-800">{formatDateTime(orderItem.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                    {(orderItem.outletName || orderItem.isPaid) && (
                                                        <div className="text-xs text-gray-600 space-y-1 border-t border-gray-100 pt-3 flex items-center justify-between">
                                                            <div>
                                                                {orderItem.outletName && <p><span className="font-medium">Outlet:</span> {orderItem.outletName}</p>}
                                                            </div>
                                                            {orderItem.isPaid && (
                                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                                                    ✅ PAID
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {(isFetchingNextOrders || hasNextOrders) && <div ref={observerTarget} className="py-4 text-center" />}
                                            {isFetchingNextOrders && (
                                                <div className="text-center py-4">
                                                    <p className="text-gray-500 text-sm">Loading more...</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
