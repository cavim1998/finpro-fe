'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { axiosInstance } from '@/lib/axios';
import { formatRupiah } from '@/lib/currency';
import { Loader2 } from 'lucide-react';

declare global {
    interface Window {
        snap?: {
            pay: (token: string, options?: Record<string, unknown>) => void;
        };
    }
}

interface Order {
    id: string;
    orderNumber?: string;
    orderNo?: string;
    status: string;
    createdAt: string;
    totalAmount: number;
    pickupDate?: string;
    deliveryDate?: string;
    deliveredAt?: string;
    paymentDueAt?: string;
    receivedConfirmedAt?: string;
    outlet?: {
        name: string;
        address?: string;
        addressText?: string;
        phone?: string;
    };
    items?: Array<{
        laundryItemId?: string;
        laundryItemName?: string;
        quantity?: number;
        pricePerItem?: number;
        qty?: number;
        price?: number;
        item?: {
            name?: string;
        };
    }>;
    stations?: Array<{
        id: string;
        stationType: string;
        status: string;
        startedAt?: string | null;
        completedAt?: string | null;
        worker?: {
            profile?: {
                fullName?: string;
            };
        };
    }>;
}

type PickupRequestListItem = {
    id: string;
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
};

type OrderListItem = {
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
    items?: Array<{
        laundryItemId?: string;
        laundryItemName?: string;
        quantity?: number;
        pricePerItem?: number;
        qty?: number;
        price?: number;
        item?: {
            name?: string;
        };
    }>;
};

export default function CheckStatusPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [orderNumber, setOrderNumber] = useState('');
    const [order, setOrder] = useState<Order | null>(null);
    const [pickupDetail, setPickupDetail] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [pickupRequests, setPickupRequests] = useState<PickupRequestListItem[]>([]);
    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [loadingPickupRequests, setLoadingPickupRequests] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [showAccountSection, setShowAccountSection] = useState(false);
    const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
    const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
    const [searchType, setSearchType] = useState<'order' | 'pickup' | null>(null);
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [filteredOrders, setFilteredOrders] = useState<OrderListItem[]>([]);
    const [filteredPickupRequests, setFilteredPickupRequests] = useState<PickupRequestListItem[]>([]);
    const [paymentDeadlines, setPaymentDeadlines] = useState<Record<string, { deadline: Date; timeRemaining: string }>>({});
    const [confirmationDeadlines, setConfirmationDeadlines] = useState<Record<string, { deadline: Date; timeRemaining: string }>>({});
    const notifiedOrdersRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            setShowAccountSection(true);
        } else if (status === 'unauthenticated') {
            // Set loading to false for unauthenticated users
            setLoadingPickupRequests(false);
            setLoadingOrders(false);
        }
    }, [status, session]);

    // Load pickup requests and orders when authenticated
    useEffect(() => {
        if (status === 'authenticated') {
            // Set both as loading immediately
            setLoadingPickupRequests(true);
            setLoadingOrders(true);

            // Run both requests in parallel with Promise.all
            (async () => {
                try {
                    const [pickupResponse, orderPickupResponse] = await Promise.all([
                        // Load pickups
                        axiosInstance.get('/pickup-requests'),
                        // Load pickups for orders (reuse if possible, but fetch separately for clarity)
                        axiosInstance.get('/pickup-requests')
                    ]);

                    // Process pickups
                    try {
                        const payload = pickupResponse?.data?.data ?? pickupResponse?.data ?? [];
                        const list = Array.isArray(payload) ? payload : [];
                        const sortedList = list.sort((a: PickupRequestListItem, b: PickupRequestListItem) => {
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                        });
                        setPickupRequests(sortedList);
                    } catch (error: any) {
                        console.error('Failed to process pickup requests:', error);
                    } finally {
                        setLoadingPickupRequests(false);
                    }

                    // Process orders
                    try {
                        const pickupData = orderPickupResponse?.data?.data ?? [];
                        const pickupsWithOrders = Array.isArray(pickupData)
                            ? pickupData.filter((p: any) => p.status === 'ARRIVED_OUTLET' && p.order?.id)
                            : [];
                        const orderIds = pickupsWithOrders.map((p: any) => p.order.id);

                        if (orderIds.length === 0) {
                            setOrders([]);
                        } else {
                            // Fetch all orders in parallel
                            const orderResponses = await Promise.allSettled(
                                orderIds.map(orderId => axiosInstance.get(`/orders/${orderId}`))
                            );

                            const ordersData: OrderListItem[] = [];
                            orderResponses.forEach((result) => {
                                if (result.status === 'fulfilled') {
                                    const orderData = result.value?.data?.data;
                                    if (orderData) {
                                        ordersData.push({
                                            ...orderData,
                                            orderNumber: orderData.orderNumber || orderData.orderNo || orderData.invoiceNumber || orderData.id,
                                            status: orderData.orderStatus || orderData.status,
                                            deliveryDate: orderData.deliveryDate || orderData.deliveredAt,
                                            isPaid: orderData.isPaid ?? false,
                                        });
                                    }
                                } else {
                                    console.error('Failed to fetch order:', result.reason);
                                }
                            });

                            const sortedOrders = ordersData.sort((a, b) => {
                                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                            });
                            setOrders(sortedOrders);
                        }
                    } catch (error: any) {
                        console.error('Failed to load orders:', error);
                    } finally {
                        setLoadingOrders(false);
                    }
                } catch (error: any) {
                    console.error('Failed to load data:', error);
                    setLoadingPickupRequests(false);
                    setLoadingOrders(false);
                }
            })();
        }
    }, [status]);

    // Sync filtered arrays whenever orders or pickups load
    useEffect(() => {
        setFilteredOrders(orders);
    }, [orders]);

    useEffect(() => {
        setFilteredPickupRequests(pickupRequests);
    }, [pickupRequests]);

    // Pickup status priority (active statuses first)
    const getPickupPriority = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'WAITING_DRIVER':
                return 0;
            case 'ARRIVED_OUTLET':
                return 1;
            case 'CANCELED':
                return 2;
            default:
                return 999;
        }
    };

    // Order status priority (active statuses first)
    const getOrderPriority = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'WAITING_DRIVER_PICKUP':
                return 0;
            case 'ON_THE_WAY_TO_OUTLET':
                return 1;
            case 'ARRIVED_AT_OUTLET':
                return 2;
            case 'WASHING':
                return 3;
            case 'IRONING':
                return 4;
            case 'PACKING':
                return 5;
            case 'WAITING_PAYMENT':
                return 6;
            case 'READY_TO_DELIVER':
                return 7;
            case 'DELIVERING_TO_CUSTOMER':
                return 8;
            case 'RECEIVED_BY_CUSTOMER':
                return 9;
            case 'CANCELED':
                return 10;
            default:
                return 999;
        }
    };

    // Get top 5 most recent + active pickup requests
    const getTopPickupRequests = () => {
        return [...pickupRequests]
            .sort((a, b) => {
                const priorityDiff = getPickupPriority(a.status) - getPickupPriority(b.status);
                if (priorityDiff !== 0) return priorityDiff;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .slice(0, 3);
    };

    // Get top 5 most recent + active orders
    const getTopOrders = () => {
        return [...orders]
            .sort((a, b) => {
                const priorityDiff = getOrderPriority(a.status) - getOrderPriority(b.status);
                if (priorityDiff !== 0) return priorityDiff;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .slice(0, 3);
    };

    // Calculate payment deadlines for each order
    useEffect(() => {
        const calculateDeadlines = () => {
            const deadlinesMap: Record<string, { deadline: Date; timeRemaining: string }> = {};
            const now = new Date();

            orders.forEach(order => {
                // Only calculate deadline for orders that need payment and are within payment window
                if (canPayOrder(order.status)) {
                    const orderDate = new Date(order.createdAt);
                    const deadline = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours from creation
                    const timeRemaining = deadline.getTime() - now.getTime();

                    if (timeRemaining > 0) {
                        const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
                        const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
                        const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);

                        deadlinesMap[order.id] = {
                            deadline,
                            timeRemaining: `${hours}h ${minutes}m ${seconds}s`,
                        };

                        // Show toast notification when deadline is within 1 hour
                        if (timeRemaining <= 60 * 60 * 1000 && !notifiedOrdersRef.current.has(order.id)) {
                            toast.warning(`Payment deadline approaching for order ${order.orderNumber}! Only ${hours}h ${minutes}m remaining.`);
                            notifiedOrdersRef.current.add(order.id);
                        }
                    } else {
                        // Deadline passed
                        deadlinesMap[order.id] = {
                            deadline,
                            timeRemaining: 'EXPIRED',
                        };
                    }
                }
            });

            setPaymentDeadlines(deadlinesMap);
        };

        calculateDeadlines();
        const interval = setInterval(calculateDeadlines, 1000); // Update every second
        return () => clearInterval(interval);
    }, [orders]);

    // Calculate auto-confirmation deadlines for delivered orders (48 hours)
    useEffect(() => {
        const calculateConfirmDeadlines = () => {
            const deadlinesMap: Record<string, { deadline: Date; timeRemaining: string }> = {};
            const now = new Date();

            orders.forEach(order => {
                // Only calculate for orders in delivering status
                if (order.status === 'DELIVERING_TO_CUSTOMER') {
                    // Use deliveryDate, or fallback to createdAt for testing
                    const referenceDate = order.deliveryDate ? new Date(order.deliveryDate) : new Date(order.createdAt);
                    const deadline = new Date(referenceDate.getTime() + 48 * 60 * 60 * 1000); // 48 hours from delivery
                    const timeRemaining = deadline.getTime() - now.getTime();

                    if (timeRemaining > 0) {
                        const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
                        const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));

                        deadlinesMap[order.id] = {
                            deadline,
                            timeRemaining: `${hours}h ${minutes}m`,
                        };
                    } else {
                        // Should be auto-confirmed
                        deadlinesMap[order.id] = {
                            deadline,
                            timeRemaining: 'AUTO-CONFIRMED',
                        };
                    }
                }
            });

            setConfirmationDeadlines(deadlinesMap);
        };

        calculateConfirmDeadlines();
        const interval = setInterval(calculateConfirmDeadlines, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [orders]);

    const fetchOrderById = async (orderId: string, { silent }: { silent?: boolean } = {}) => {
        if (!silent) {
            setLoading(true);
        } else {
            setLoadingOrders(true);
        }
        setSearched(false);
        setOrder(null);
        setPickupDetail(null);
        setSearchType(null);

        try {
            const response = await axiosInstance.get(`/orders/${orderId}`);
            const orderData = response?.data?.data;
            if (!orderData) {
                throw new Error('Order not found');
            }

            setOrder(orderData);
            setSearchType('order');
            setSearched(true);
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Order not found. Please check the order ID.';
            toast.error(message);
            setOrder(null);
            setPickupDetail(null);
            setSearched(true);
        } finally {
            setLoading(false);
            setLoadingOrders(false);
        }
    };

    const handleSearch = async () => {
        const query = orderNumber.trim();
        if (!query) {
            toast.error('Please enter an order ID');
            return;
        }

        await fetchOrderById(query);
    };

    const handleClearSearch = () => {
        setOrderNumber('');
        setOrder(null);
        setSearched(false);
        setSearchType(null);
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

    const formatStatus = (status: string) => {
        return status
            ?.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const loadPickupRequests = useCallback(async () => {
        setLoadingPickupRequests(true);
        try {
            const response = await axiosInstance.get('/pickup-requests');
            const payload = response?.data?.data ?? response?.data ?? [];
            const list = Array.isArray(payload) ? payload : [];

            // Sort by createdAt descending (newest first)
            const sortedList = list.sort((a: PickupRequestListItem, b: PickupRequestListItem) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setPickupRequests(sortedList);
        } catch (error: any) {
            console.error('Failed to load pickup requests:', error);
        } finally {
            setLoadingPickupRequests(false);
        }
    }, []);

    const loadOrders = useCallback(async () => {
        setLoadingOrders(true);
        try {
            // Step 1: Fetch all pickup requests
            const pickupResponse = await axiosInstance.get('/pickup-requests');
            const pickupData = pickupResponse?.data?.data ?? [];

            // Step 2: Filter pickups with ARRIVED_OUTLET status that have orders
            const pickupsWithOrders = Array.isArray(pickupData)
                ? pickupData.filter((p: any) => p.status === 'ARRIVED_OUTLET' && p.order?.id)
                : [];

            // Step 3: Fetch each order detail
            const orderIds = pickupsWithOrders.map((p: any) => p.order.id);
            const ordersData: OrderListItem[] = [];

            for (const orderId of orderIds) {
                try {
                    const orderResponse = await axiosInstance.get(`/orders/${orderId}`);
                    const orderData = orderResponse?.data?.data;
                    if (orderData) {
                        ordersData.push({
                            ...orderData,
                            orderNumber: orderData.orderNumber || orderData.orderNo || orderData.invoiceNumber || orderData.id,
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
            const sortedOrders = ordersData.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setOrders(sortedOrders);
        } catch (error: any) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    }, []);

    const refreshTrackedOrder = async () => {
        if (!order?.id) {
            return;
        }
        await fetchOrderById(order.id, { silent: true });
    };

    const formatStatusLabel = (status?: string) => {
        if (!status) {
            return '-';
        }
        return status.replace(/_/g, ' ');
    };

    const formatDateTime = (iso?: string) => {
        if (!iso) {
            return '-';
        }
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) {
            return '-';
        }
        return date.toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const getOrderTrackingSteps = () => [
        'WAITING_DRIVER_PICKUP',
        'ON_THE_WAY_TO_OUTLET',
        'ARRIVED_AT_OUTLET',
        'WASHING',
        'IRONING',
        'PACKING',
        'WAITING_PAYMENT',
        'READY_TO_DELIVER',
        'DELIVERING_TO_CUSTOMER',
        'RECEIVED_BY_CUSTOMER',
    ];

    const getStepState = (currentStatus: string, step: string) => {
        const steps = getOrderTrackingSteps();
        const currentIndex = steps.indexOf(currentStatus);
        const stepIndex = steps.indexOf(step);
        if (currentIndex === -1 || stepIndex === -1) {
            return 'upcoming';
        }
        if (stepIndex < currentIndex) {
            return 'completed';
        }
        if (stepIndex === currentIndex) {
            return 'current';
        }
        return 'upcoming';
    };

    const getStepClasses = (state: 'completed' | 'current' | 'upcoming') => {
        switch (state) {
            case 'completed':
                return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
            case 'current':
                return 'bg-[#1dacbc] text-white border border-[#1dacbc]';
            default:
                return 'bg-gray-100 text-gray-500 border border-gray-200';
        }
    };

    const canPayOrder = (status: string) => {
        const payable = new Set([
            'ARRIVED_AT_OUTLET',
            'WASHING',
            'IRONING',
            'PACKING',
            'WAITING_PAYMENT',
        ]);
        return payable.has(status);
    };

    const isPaidOrder = (isPaid: boolean) => {
        return isPaid === true;
    };

    const handlePayOrder = (orderId: string) => {
        setPayingOrderId(orderId);
        router.push(`/payment/${orderId}`);
    };

    const handleConfirmReceipt = async (orderId: string) => {
        setConfirmingOrderId(orderId);
        try {
            const response = await axiosInstance.patch(`/orders/${orderId}`, {
                status: 'RECEIVED_BY_CUSTOMER'
            });
            const responseData = response?.data?.data;

            toast.success(response?.data?.message || 'Order received successfully');

            // Reload orders to get updated status and receivedConfirmedAt
            refreshTrackedOrder();
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Failed to confirm receipt';
            toast.error(message);
        } finally {
            setConfirmingOrderId(null);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

            {/* Main Content */}
            <div className="grow">
                {/* Hero Section */}
                <div className="bg-linear-to-r from-[#1dacbc] to-[#14939e] text-white py-10">
                    <div className="container mx-auto px-4">
                        <h1 className="text-3xl md:text-4xl font-bold">Check Status</h1>
                        <p className="text-teal-50 text-sm mt-1">Track your laundry orders and pickup requests</p>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                        {/* Sidebar - Track Order Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-[#1dacbc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Track Order
                                </h2>
                                <p className="text-gray-500 text-xs mb-4">Search for any order using order number</p>

                                {/* Search Form */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-gray-700 text-xs font-semibold mb-1">
                                            Search Order ID
                                        </label>
                                        <input
                                            type="text"
                                            value={orderNumber}
                                            onChange={(e) => setOrderNumber(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            placeholder="Enter order ID"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1dacbc] focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        disabled={loading}
                                        className="w-full bg-[#1dacbc] text-white text-sm py-2 px-3 rounded-md hover:bg-[#14939e] transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                                    >
                                        {loading ? 'Searching...' : 'Search'}
                                    </button>

                                    {order && (
                                        <button
                                            onClick={handleClearSearch}
                                            className="w-full bg-red-50 text-red-700 text-sm py-2 px-3 rounded-md hover:bg-red-100 transition font-semibold border border-red-200"
                                        >
                                            Clear Search
                                        </button>
                                    )}

                                    {/* Search Result */}
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        {!searched && (
                                            <p className="text-gray-500 text-xs">Enter order ID above to search</p>
                                        )}
                                        {searched && !order && !loading && (
                                            <p className="text-red-500 text-xs">Order not found</p>
                                        )}
                                        {order && searchType === 'order' && (
                                            <div className="space-y-2 text-xs">
                                                <div className="text-xs font-semibold text-[#1dacbc] mb-2">📦 Order Found</div>
                                                <div>
                                                    <p className="text-gray-500">Order Number</p>
                                                    <p className="font-semibold text-gray-800">{order.orderNumber || order.orderNo}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Amount</p>
                                                    <p className="font-semibold text-[#1dacbc]">{formatCurrency(order.totalAmount)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Status</p>
                                                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${getOrderStatusColor(order.status)}`}>
                                                        {formatStatus(order.status)}
                                                    </span>
                                                </div>

                                                {/* Items */}
                                                {order.items && order.items.length > 0 && (
                                                    <div className="pt-2 border-t border-gray-100">
                                                        <p className="text-gray-500 mb-1 font-medium text-xs">Items:</p>
                                                        <div className="space-y-1">
                                                            {order.items.map((item, idx) => {
                                                                const itemName = item.laundryItemName || item.item?.name || 'Unknown Item';
                                                                const qty = item.quantity || item.qty || 0;
                                                                return (
                                                                    <p key={idx} className="text-xs text-gray-600">
                                                                        • {itemName} <span className="text-gray-500">x{qty}</span>
                                                                    </p>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-3 border-t border-gray-200">
                                        <p className="text-gray-700 text-xs font-semibold mb-2">View All</p>
                                        <p className="text-gray-600 text-xs mb-3">Use the history page for advanced filtering.</p>
                                        <a
                                            href="/check-status/history"
                                            className="w-full inline-block px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition font-semibold text-center"
                                        >
                                            View Full History
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content - History */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Orders Section */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-[#1dacbc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        Orders
                                    </h2>
                                    {showAccountSection && (
                                        <button
                                            type="button"
                                            onClick={refreshTrackedOrder}
                                            disabled={loadingOrders || !order}
                                            className="text-lg text-[#1dacbc] hover:text-[#14939e] transition disabled:opacity-50"
                                            title="Refresh orders"
                                        >
                                        </button>
                                    )}
                                </div>

                                {!showAccountSection ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 text-sm">Sign in to view your orders</p>
                                    </div>
                                ) : (status === 'loading' || loadingOrders) ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-12 h-12 text-[#1dacbc] animate-spin mb-4" />
                                        <p className="text-gray-500">Loading your orders...</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        <p className="text-gray-500 text-sm">No orders to display</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {getTopOrders().map((orderItem) => (
                                            <div key={orderItem.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                                                <div className="grid grid-cols-2 gap-4 mb-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Order Number</p>
                                                        <p className="text-sm text-gray-800">{orderItem.orderNumber}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 mb-1">Amount</p>
                                                        <p className="text-sm font-semibold text-[#1dacbc]">{formatRupiah(orderItem.totalAmount)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-600 mb-3">
                                                    <p><span className="font-medium">Order ID:</span> {orderItem.id}</p>
                                                </div>
                                                <div className="mb-3 pb-3 border-b border-gray-100">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded inline-block ${getOrderStatusColor(orderItem.status)}`}>
                                                        {formatStatusLabel(orderItem.status)}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-600 space-y-1 mb-4">
                                                    {orderItem.outletName && <p><span className="font-medium">Outlet:</span> {orderItem.outletName}</p>}
                                                    <p><span className="font-medium">Date:</span> {formatDateTime(orderItem.createdAt)}</p>
                                                </div>

                                                {/* Laundry Items */}
                                                {orderItem.items && orderItem.items.length > 0 && (
                                                    <div className="mb-4 pb-4 border-b border-gray-100">
                                                        <p className="text-xs text-gray-500 mb-2 font-medium">Items:</p>
                                                        <div className="space-y-1">
                                                            {orderItem.items.map((item, idx) => {
                                                                const itemName = item.laundryItemName || item.item?.name || 'Unknown Item';
                                                                const qty = item.quantity || item.qty || 0;
                                                                return (
                                                                    <p key={idx} className="text-xs text-gray-600">
                                                                        • {itemName} <span className="text-gray-500">x{qty}</span>
                                                                    </p>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-2">
                                                    {isPaidOrder(orderItem.isPaid ?? false) ? (
                                                        <div className="text-xs font-semibold px-3 py-1 rounded bg-green-100 text-green-700">
                                                            ✅ PAID
                                                        </div>
                                                    ) : canPayOrder(orderItem.status) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePayOrder(orderItem.id)}
                                                            disabled={payingOrderId === orderItem.id}
                                                            className="px-3 py-1 bg-[#1dacbc] text-white text-xs rounded-md font-semibold hover:bg-[#14939e] transition disabled:bg-gray-400 whitespace-nowrap"
                                                        >
                                                            {payingOrderId === orderItem.id ? 'Processing...' : 'Pay Here'}
                                                        </button>
                                                    )}
                                                    {orderItem.status === 'DELIVERING_TO_CUSTOMER' && (
                                                        <>
                                                            {confirmationDeadlines[orderItem.id] && (
                                                                <div className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700">
                                                                    🕐 Auto-confirm in {confirmationDeadlines[orderItem.id].timeRemaining}
                                                                </div>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleConfirmReceipt(orderItem.id)}
                                                                disabled={confirmingOrderId === orderItem.id}
                                                                className="px-3 py-1 bg-green-600 text-white text-xs rounded-md font-semibold hover:bg-green-700 transition disabled:bg-gray-400 whitespace-nowrap"
                                                            >
                                                                {confirmingOrderId === orderItem.id ? 'Confirming...' : 'I Received It'}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {orders.length > 5 && (
                                            <a
                                                href="/check-status/history"
                                                className="w-full block px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition font-semibold text-center"
                                            >
                                                See All Orders ({orders.length})
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Pickup Requests Section */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-[#1dacbc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Pickup Requests
                                    </h2>
                                    {showAccountSection && (
                                        <button
                                            type="button"
                                            onClick={loadPickupRequests}
                                            disabled={loadingPickupRequests}
                                            className="text-lg text-[#1dacbc] hover:text-[#14939e] transition disabled:opacity-50"
                                            title="Refresh pickup requests"
                                        >
                                        </button>
                                    )}
                                </div>

                                {!showAccountSection ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 text-sm">Sign in to view your pickup requests</p>
                                    </div>
                                ) : (status === 'loading' || loadingPickupRequests) ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-12 h-12 text-[#1dacbc] animate-spin mb-4" />
                                        <p className="text-gray-500">Loading your pickup requests...</p>
                                    </div>
                                ) : pickupRequests.length === 0 ? (
                                    <div className="text-center py-8">
                                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <p className="text-gray-500 text-sm">No pickup requests yet</p>
                                    </div>
                                ) : filteredPickupRequests.length === 0 ? (
                                    <div className="text-center py-8">
                                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <p className="text-gray-500 text-sm">No pickup requests found for the selected date range</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {getTopPickupRequests().map((request) => (
                                            <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                                                <div className="grid grid-cols-2 gap-4 mb-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Pickup ID</p>
                                                        <p className="text-sm font-semibold text-gray-800">{request.id}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 mb-1">Scheduled</p>
                                                        <p className="text-sm font-medium text-gray-800">{formatDateTime(request.scheduledPickupAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="mb-3 pb-3 border-b border-gray-100">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded inline-block ${getPickupRequestStatusColor(request.status)}`}>
                                                        {formatStatusLabel(request.status)}
                                                    </span>
                                                </div>
                                                {(request.outletName || (request.distanceKm !== undefined && !Number.isNaN(Number(request.distanceKm))) || request.notes) && (
                                                    <div className="text-xs text-gray-600 space-y-1">
                                                        {request.outletName && <p><span className="font-medium">Outlet:</span> {request.outletName}</p>}
                                                        {request.distanceKm !== undefined && !Number.isNaN(Number(request.distanceKm)) && (
                                                            <p><span className="font-medium">Distance:</span> {Number(request.distanceKm).toFixed(2)} km</p>
                                                        )}
                                                        {request.notes && (
                                                            <p><span className="font-medium">Notes:</span> {request.notes}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {pickupRequests.length > 5 && (
                                            <a
                                                href="/check-status/history"
                                                className="w-full block px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition font-semibold text-center"
                                            >
                                                See All Pickups ({pickupRequests.length})
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>


                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
