'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { axiosInstance } from '@/lib/axios';
import { formatRupiah } from '@/lib/currency';

interface PaymentDetail {
    id: number;
    orderId: string;
    provider: string;
    amount: number;
    status: string;
    gatewayRef?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface OrderDetail {
    id: string;
    orderNumber?: string;
    status: string;
    totalAmount?: number;
}

const paidOrderStatuses = new Set([
    'READY_TO_DELIVER',
    'DELIVERING_TO_CUSTOMER',
    'RECEIVED_BY_CUSTOMER',
]);

const paidPaymentStatuses = new Set(['PAID', 'SETTLEMENT', 'CAPTURE', 'SUCCESS']);
const failedPaymentStatuses = new Set(['FAILED', 'EXPIRED', 'REFUNDED']);

export default function PaymentFinishPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState<PaymentDetail[]>([]);
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!orderId) {
            setError('Missing orderId');
            return;
        }

        const loadPayments = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axiosInstance.get(`/payments/order/${orderId}`);
                const payload = response?.data?.data ?? [];
                const list = Array.isArray(payload) ? payload : [payload];
                setPayments(list);
            } catch (err: any) {
                const message = err?.response?.data?.message || 'Failed to load payment status.';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        const loadOrder = async () => {
            try {
                const response = await axiosInstance.get(`/orders/${orderId}`);
                const payload = response?.data?.data ?? response?.data;
                if (payload) {
                    setOrder({
                        id: payload.id,
                        orderNumber: payload.orderNumber || payload.orderNo || payload.invoiceNumber || payload.id,
                        status: payload.status,
                        totalAmount: payload.totalAmount ?? payload.totalPrice ?? payload.total ?? 0,
                    });
                }
            } catch (err: any) {
                const message = err?.response?.data?.message;
                if (message) {
                    console.warn('Failed to load order status:', message);
                }
            }
        };

        const loadAll = async () => {
            await Promise.all([loadPayments(), loadOrder()]);
        };

        loadAll();
        
        pollIntervalRef.current = setInterval(() => {
            loadAll();
        }, 3000);
        
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    
    }, [orderId]);

    useEffect(() => {
        const latestPayment = payments[0];
        const isOrderPaid = order?.status ? paidOrderStatuses.has(order.status) : false;
        const isPaid = isOrderPaid || (latestPayment?.status ? paidPaymentStatuses.has(latestPayment.status) : false);
        const isFailed = latestPayment?.status ? failedPaymentStatuses.has(latestPayment.status) : false;

        if ((isPaid || isFailed) && pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    }, [payments, order?.status]);

    const latestPayment = payments[0];
    const isOrderPaid = order?.status ? paidOrderStatuses.has(order.status) : false;
    const isPaid = isOrderPaid || (latestPayment?.status ? paidPaymentStatuses.has(latestPayment.status) : false);
    const isFailed = latestPayment?.status ? failedPaymentStatuses.has(latestPayment.status) : false;
    const isPending = latestPayment?.status === 'PENDING' && !isPaid;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

            <main className="flex-1">
                <div className="bg-gradient-to-r from-[#1dacbc] to-[#14939e] text-white py-10">
                    <div className="container mx-auto px-4">
                        <h1 className="text-3xl md:text-4xl font-bold">Payment Status</h1>
                        <p className="text-teal-50 text-sm mt-1">Your payment is being verified by Midtrans</p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-10 space-y-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        {loading ? (
                            <p className="text-sm text-gray-500">Loading payment status...</p>
                        ) : error ? (
                            <p className="text-sm text-red-600">{error}</p>
                        ) : latestPayment ? (
                            <div className="space-y-3 text-sm text-gray-700">
                                <p><span className="font-medium">Order ID:</span> {latestPayment.orderId}</p>
                                {order?.orderNumber && (
                                    <p><span className="font-medium">Order Number:</span> {order.orderNumber}</p>
                                )}
                                {order?.status && (
                                    <p><span className="font-medium">Order Status:</span> {order.status}</p>
                                )}
                                <p><span className="font-medium">Status:</span> {latestPayment.status}</p>
                                <p><span className="font-medium">Provider:</span> {latestPayment.provider}</p>
                                <p><span className="font-medium">Amount:</span> {formatRupiah(latestPayment.amount)}</p>
                                {latestPayment.gatewayRef && (
                                    <p><span className="font-medium">Gateway Ref:</span> {latestPayment.gatewayRef}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No payment data found.</p>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">What happens next?</h2>
                        <p className="text-sm text-gray-600">Payment updates are sent by Midtrans. If the status is still pending, refresh later.</p>
                        {isPending && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                                ℹ️ Waiting for payment confirmation... (auto-refreshing every 3s)
                            </div>
                        )}
                        {isPaid && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                                ✅ Payment received! Your order will be processed soon.
                            </div>
                        )}
                        {isFailed && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                                ❌ Payment failed. Please retry.
                            </div>
                        )}
                        <div className="mt-4 flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="px-4 py-2 bg-[#1dacbc] text-white rounded-lg text-sm font-semibold hover:bg-[#14939e] transition"
                            >
                                Back to Home
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/check-status')}
                                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                            >
                                Back to Check Status
                            </button>
                            {orderId && (
                                <button
                                    type="button"
                                    onClick={() => router.push(`/payment/${orderId}`)}
                                    className={`px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold transition ${
                                        isPaid || isFailed
                                            ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                    disabled={isPaid || isFailed}
                                >
                                    Retry Payment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
