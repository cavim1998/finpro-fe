'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { axiosInstance } from '@/lib/axios';

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

export default function CheckStatusPage() {
    const [orderNumber, setOrderNumber] = useState('');
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!orderNumber.trim()) {
            toast.error('Please enter an order number');
            return;
        }

        setLoading(true);
        setSearched(false);
        try {
            const response = await axiosInstance.get(`/orders/track/${orderNumber.trim()}`);
            const orderData = response?.data?.data;
            if (orderData) {
                setOrder(orderData);
                setSearched(true);
            }
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Order not found. Please check your order number.';
            toast.error(message);
            setOrder(null);
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

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            
            {/* Main Content */}
            <div className="grow">
                {/* Hero Section */}
                <div className="bg-linear-to-r from-[#1dacbc] to-[#14939e] text-white py-8">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold">Check Status</h1>
                        <p className="text-[#e8faf7] text-lg mt-2">Track your laundry order</p>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* Sidebar - Search Card */}
                        <div className="md:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="w-40 h-40 mx-auto bg-gradient-to-br from-[#1dacbc] to-[#14939e] rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Track Order</h2>
                                <p className="text-gray-500 mb-4 text-center text-sm">Enter your order number to check status</p>

                                {/* Search Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                                            Order Number
                                        </label>
                                        <input
                                            type="text"
                                            value={orderNumber}
                                            onChange={(e) => setOrderNumber(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            placeholder="e.g., ORD-2024-001"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1dacbc] focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        disabled={loading}
                                        className="w-full bg-[#1dacbc] text-white py-2 px-4 rounded-lg hover:bg-[#14939e] transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                                    >
                                        {loading ? 'Searching...' : 'Check Status'}
                                    </button>
                                </div>

                                {/* Quick Info */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="font-semibold text-gray-800 mb-3 text-sm">Need Help?</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-start">
                                            <span className="text-[#1dacbc] mr-2">•</span>
                                            <span>Your order number is sent to your email</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-[#1dacbc] mr-2">•</span>
                                            <span>Format: ORD-YYYY-XXX</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-[#1dacbc] mr-2">•</span>
                                            <span>Contact support if you need assistance</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Order Details */}
                        <div className="md:col-span-2">
                            {!searched && !order && (
                                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                    <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No order to display</h3>
                                    <p className="text-gray-500">Enter your order number to track your order</p>
                                </div>
                            )}

                            {searched && !order && !loading && (
                                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                    <svg className="w-24 h-24 mx-auto text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Order not found</h3>
                                    <p className="text-gray-500">Please check your order number and try again</p>
                                </div>
                            )}

                            {order && (
                                <div className="space-y-6">
                                    {/* Order Status Card */}
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-2xl font-bold text-[#1dacbc] mb-2">
                                                    Order Details
                                                </h3>
                                                <p className="text-gray-600 text-sm">Order #{order.orderNumber}</p>
                                            </div>
                                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                                                {formatStatus(order.status)}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Order Date */}
                                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                                <span className="text-gray-600 text-sm font-semibold">Order Date</span>
                                                <span className="text-gray-800">
                                                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            </div>

                                            {/* Pickup Date */}
                                            {order.pickupDate && (
                                                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                                    <span className="text-gray-600 text-sm font-semibold">Pickup Date</span>
                                                    <span className="text-gray-800">
                                                        {new Date(order.pickupDate).toLocaleDateString('id-ID', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Delivery Date */}
                                            {order.deliveryDate && (
                                                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                                    <span className="text-gray-600 text-sm font-semibold">Delivery Date</span>
                                                    <span className="text-gray-800">
                                                        {new Date(order.deliveryDate).toLocaleDateString('id-ID', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Total Amount */}
                                            <div className="flex justify-between items-center py-3">
                                                <span className="text-gray-600 text-sm font-semibold">Total Amount</span>
                                                <span className="text-xl font-bold text-[#1dacbc]">
                                                    {formatCurrency(order.totalAmount)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Outlet Information */}
                                    {order.outlet && (
                                        <div className="bg-white rounded-lg shadow-md p-6">
                                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                                <svg className="w-5 h-5 mr-2 text-[#1dacbc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Outlet Information
                                            </h3>
                                            <div className="space-y-2">
                                                <p className="text-gray-800 font-semibold">{order.outlet.name}</p>
                                                <p className="text-gray-600 text-sm">{order.outlet.address}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Order Items */}
                                    {order.items && order.items.length > 0 && (
                                        <div className="bg-white rounded-lg shadow-md p-6">
                                            <h3 className="text-xl font-bold text-gray-800 mb-4">Order Items</h3>
                                            <div className="space-y-3">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                                                        <div className="flex-1">
                                                            <p className="text-gray-800 font-semibold">{item.laundryItemName}</p>
                                                            <p className="text-gray-500 text-sm">
                                                                {item.quantity} x {formatCurrency(item.pricePerItem)}
                                                            </p>
                                                        </div>
                                                        <span className="text-gray-800 font-semibold">
                                                            {formatCurrency(item.quantity * item.pricePerItem)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Status Timeline */}
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">Order Timeline</h3>
                                        <div className="space-y-4">
                                            {/* Timeline steps based on status */}
                                            {['pending', 'awaiting_pickup', 'picked_up', 'washing', 'ironing', 'ready_for_delivery', 'on_delivery', 'delivered', 'completed'].map((step, index) => {
                                                const isActive = order.status.toLowerCase() === step;
                                                const isPassed = ['pending', 'awaiting_pickup', 'picked_up', 'washing', 'ironing', 'ready_for_delivery', 'on_delivery', 'delivered', 'completed'].indexOf(order.status.toLowerCase()) >= index;
                                                
                                                return (
                                                    <div key={step} className="flex items-center">
                                                        <div className={`w-4 h-4 rounded-full ${isPassed ? 'bg-[#1dacbc]' : 'bg-gray-300'} ${isActive ? 'ring-4 ring-[#1dacbc] ring-opacity-30' : ''}`}></div>
                                                        <div className="ml-4 flex-1">
                                                            <p className={`text-sm font-semibold ${isPassed ? 'text-gray-800' : 'text-gray-400'}`}>
                                                                {formatStatus(step)}
                                                            </p>
                                                        </div>
                                                        {isActive && (
                                                            <span className="text-xs font-semibold text-[#1dacbc]">Current</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
