'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { axiosInstance } from '@/lib/axios';
import Cookies from 'js-cookie';
import { formatRupiah } from '@/lib/currency';
import { IoRefresh } from 'react-icons/io5';

declare global {
    interface Window {
        snap?: {
            pay: (token: string, options?: Record<string, unknown>) => void;
        };
    }
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    totalAmount: number;
    pickupDate?: string;
    deliveryDate?: string;
    outlet?: {
        name: string;
        address: string;
    };
    items?: Array<{
        laundryItemId: string;
        laundryItemName: string;
        quantity: number;
        pricePerItem: number;
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
};

export default function CheckStatusPage() {
    const router = useRouter();
    const [orderNumber, setOrderNumber] = useState('');
    const [order, setOrder] = useState<Order | null>(null);
    const [pickupDetail, setPickupDetail] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [pickupRequests, setPickupRequests] = useState<PickupRequestListItem[]>([]);
    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [loadingPickupRequests, setLoadingPickupRequests] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
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
        const userCookie = Cookies.get('user_data');
        if (!userCookie) {
            return;
        }
        setShowAccountSection(true);
        loadPickupRequests();
        loadOrders();
    }, []);

    useEffect(() => {
        // Filter orders based on date range
        const filtered = orders.filter(order => {
            if (!filterDateFrom && !filterDateTo) return true;
            
            // Parse order date (handle both timezone-aware and simple dates)
            const orderDate = new Date(order.createdAt);
            const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
            
            if (filterDateFrom) {
                // Parse input date and create date at start of day
                const [year, month, day] = filterDateFrom.split('-');
                const fromDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                if (orderDateOnly < fromDate) return false;
            }
            
            if (filterDateTo) {
                // Parse input date and create date at end of day
                const [year, month, day] = filterDateTo.split('-');
                const toDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 23, 59, 59, 999);
                if (orderDateOnly > toDate) return false;
            }
            
            return true;
        });
        
        setFilteredOrders(filtered);
    }, [orders, filterDateFrom, filterDateTo]);

    useEffect(() => {
        // Filter pickup requests based on scheduled date range
        const filtered = pickupRequests.filter(request => {
            if (!filterDateFrom && !filterDateTo) return true;
            
            // Parse scheduled pickup date (not createdAt - user filters by when pickup is scheduled)
            const scheduledDate = new Date(request.scheduledPickupAt);
            const scheduledDateOnly = new Date(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate());
            
            if (filterDateFrom) {
                // Parse input date and create date at start of day
                const [year, month, day] = filterDateFrom.split('-');
                const fromDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                if (scheduledDateOnly < fromDate) return false;
            }
            
            if (filterDateTo) {
                // Parse input date and create date at end of day
                const [year, month, day] = filterDateTo.split('-');
                const toDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 23, 59, 59, 999);
                if (scheduledDateOnly > toDate) return false;
            }
            
            return true;
        });
        
        setFilteredPickupRequests(filtered);
    }, [pickupRequests, filterDateFrom, filterDateTo]);

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

    const handleSearch = async () => {
        const query = orderNumber.trim().toUpperCase();
        if (!query) {
            toast.error('Please enter an order number');
            return;
        }

        setLoading(true);
        setSearched(false);
        setOrder(null);
        setPickupDetail(null);
        setSearchType(null);

        try {
            // Search from loaded orders first
            const foundOrder = orders.find(o => (o.orderNumber ?? '').toUpperCase() === query);
            
            if (foundOrder) {
                // Fetch full order details
                const response = await axiosInstance.get(`/orders/${foundOrder.id}`);
                const orderData = response?.data?.data;
                if (orderData) {
                    setOrder(orderData);
                    setSearchType('order');
                    setSearched(true);
                    return;
                }
            }
            
            throw new Error('Order not found');
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Order not found. Please check the order number.';
            toast.error(message);
            setOrder(null);
            setPickupDetail(null);
            setSearched(true);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'awaiting_pickup':
                return 'bg-blue-100 text-blue-800';
            case 'picked_up':
                return 'bg-indigo-100 text-indigo-800';
            case 'washing':
                return 'bg-purple-100 text-purple-800';
            case 'ironing':
                return 'bg-pink-100 text-pink-800';
            case 'ready_for_delivery':
                return 'bg-cyan-100 text-cyan-800';
            case 'on_delivery':
                return 'bg-teal-100 text-teal-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-green-200 text-green-900';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPickupRequestStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'WAITING_DRIVER':
                return 'bg-yellow-50 text-yellow-700 border border-yellow-300';
            case 'DRIVER_ASSIGNED':
                return 'bg-blue-50 text-blue-700 border border-blue-300';
            case 'PICKED_UP':
                return 'bg-purple-50 text-purple-700 border border-purple-300';
            case 'ARRIVED_OUTLET':
                return 'bg-green-50 text-green-700 border border-green-300';
            case 'CANCELLED':
                return 'bg-red-50 text-red-700 border border-red-300';
            default:
                return 'bg-gray-50 text-gray-700 border border-gray-300';
        }
    };

    const getOrderStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return 'bg-yellow-50 text-yellow-700 border border-yellow-300';
            case 'AWAITING_PICKUP':
                return 'bg-orange-50 text-orange-700 border border-orange-300';
            case 'ARRIVED_AT_OUTLET':
                return 'bg-blue-50 text-blue-700 border border-blue-300';
            case 'WASHING':
                return 'bg-indigo-50 text-indigo-700 border border-indigo-300';
            case 'IRONING':
                return 'bg-pink-50 text-pink-700 border border-pink-300';
            case 'PACKING':
                return 'bg-purple-50 text-purple-700 border border-purple-300';
            case 'READY_FOR_DELIVERY':
                return 'bg-cyan-50 text-cyan-700 border border-cyan-300';
            case 'ON_DELIVERY':
                return 'bg-teal-50 text-teal-700 border border-teal-300';
            case 'RECEIVING_BY_CUSTOMER':
                return 'bg-blue-50 text-blue-700 border border-blue-300';
            case 'COMPLETED':
                return 'bg-green-50 text-green-700 border border-green-300';
            case 'CANCELLED':
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

    const loadPickupRequests = async () => {
        setLoadingPickupRequests(true);
        try {
            const response = await axiosInstance.get('/pickup-requests');
            const payload = response?.data?.data ?? response?.data ?? [];
            const list = Array.isArray(payload) ? payload : [];
            setPickupRequests(list);
        } catch (error: any) {
            console.error('Failed to load pickup requests:', error);
        } finally {
            setLoadingPickupRequests(false);
        }
    };

    const loadOrders = async () => {
        setLoadingOrders(true);
        try {
            const response = await axiosInstance.get('/orders');
            const payload = response?.data?.data ?? response?.data ?? [];
            const list = Array.isArray(payload) ? payload : [];
            const normalized = list.map((item: any) => ({
                ...item,
                orderNumber: item.orderNumber || item.orderNo || item.invoiceNumber || item.id,
                // Support both deliveryDate dan deliveredAt from backend
                deliveryDate: item.deliveryDate || item.deliveredAt,
            }));
            setOrders(normalized);
        } catch (error: any) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoadingOrders(false);
        }
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
            loadOrders();
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
                                            Search Order Number
                                        </label>
                                        <input
                                            type="text"
                                            value={orderNumber}
                                            onChange={(e) => setOrderNumber(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            placeholder="Enter order number"
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

                                    {/* Date Range Filter */}
                                    <div className="pt-3 border-t border-gray-200">
                                        <p className="text-gray-700 text-xs font-semibold mb-2">Filter by Date</p>
                                        <div>
                                            <label className="block text-gray-600 text-xs mb-1">From</label>
                                            <input
                                                type="date"
                                                value={filterDateFrom}
                                                onChange={(e) => setFilterDateFrom(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1dacbc] focus:border-transparent outline-none"
                                            />
                                        </div>
                                        <div className="mt-2">
                                            <label className="block text-gray-600 text-xs mb-1">To</label>
                                            <input
                                                type="date"
                                                value={filterDateTo}
                                                onChange={(e) => setFilterDateTo(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1dacbc] focus:border-transparent outline-none"
                                            />
                                        </div>
                                        {(filterDateFrom || filterDateTo) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFilterDateFrom('');
                                                    setFilterDateTo('');
                                                }}
                                                className="w-full mt-2 px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition font-semibold"
                                            >
                                                Clear Date Filter
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Search Result */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    {!searched && (
                                        <p className="text-gray-500 text-xs">Enter order number above to search</p>
                                    )}
                                    {searched && !order && !loading && (
                                        <p className="text-red-500 text-xs">Order not found</p>
                                    )}
                                    {order && searchType === 'order' && (
                                        <div className="space-y-2 text-xs">
                                            <div className="text-xs font-semibold text-[#1dacbc] mb-2">📦 Order Found</div>
                                            <div>
                                                <p className="text-gray-500">Order Number</p>
                                                <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Amount</p>
                                                <p className="font-semibold text-[#1dacbc]">{formatCurrency(order.totalAmount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Status</p>
                                                <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                    {formatStatus(order.status)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Content - History */}
                        <div className="lg:col-span-3 space-y-6">
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
                                            <IoRefresh className={loadingPickupRequests ? 'animate-spin' : ''} />
                                        </button>
                                    )}
                                </div>

                                {!showAccountSection ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 text-sm">Sign in to view your pickup requests</p>
                                    </div>
                                ) : loadingPickupRequests ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 text-sm">Loading...</p>
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
                                        {filteredPickupRequests.map((request) => (
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
                                    </div>
                                )}
                            </div>

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
                                            onClick={loadOrders}
                                            disabled={loadingOrders}
                                            className="text-lg text-[#1dacbc] hover:text-[#14939e] transition disabled:opacity-50"
                                            title="Refresh orders"
                                        >
                                            <IoRefresh className={loadingOrders ? 'animate-spin' : ''} />
                                        </button>
                                    )}
                                </div>

                                {!showAccountSection ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 text-sm">Sign in to view your orders</p>
                                    </div>
                                ) : loadingOrders ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 text-sm">Loading...</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        <p className="text-gray-500 text-sm">No orders yet</p>
                                    </div>
                                ) : filteredOrders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        <p className="text-gray-500 text-sm">No orders found for the selected date range</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredOrders.map((orderItem) => (
                                            <div key={orderItem.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                                                <div className="grid grid-cols-2 gap-4 mb-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Order Number</p>
                                                        <p className="text-sm font-semibold text-gray-800">{orderItem.orderNumber}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 mb-1">Amount</p>
                                                        <p className="text-sm font-semibold text-[#1dacbc]">{formatRupiah(orderItem.totalAmount)}</p>
                                                    </div>
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
                                                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-2">
                                                    {canPayOrder(orderItem.status) && (
                                                        <>
                                                            {paymentDeadlines[orderItem.id] && (
                                                                <div className={`text-xs font-semibold px-2 py-1 rounded ${
                                                                    paymentDeadlines[orderItem.id].timeRemaining === 'EXPIRED'
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                    ⏱️ {paymentDeadlines[orderItem.id].timeRemaining}
                                                                </div>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handlePayOrder(orderItem.id)}
                                                                disabled={payingOrderId === orderItem.id}
                                                                className="px-3 py-1 bg-[#1dacbc] text-white text-xs rounded-md font-semibold hover:bg-[#14939e] transition disabled:bg-gray-400 whitespace-nowrap"
                                                            >
                                                                {payingOrderId === orderItem.id ? 'Processing...' : 'Pay via QRIS'}
                                                            </button>
                                                        </>
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
