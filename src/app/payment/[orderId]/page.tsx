'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { axiosInstance } from '@/lib/axios';
import { formatRupiah } from '@/lib/currency';

declare global {
    interface Window {
        snap?: {
            pay: (token: string, options?: Record<string, unknown>) => void;
        };
    }
}

interface OrderDetail {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    outletName?: string;
    createdAt?: string;
}

interface PaymentDetail {
    id: string;
    status: string;
    amount: number;
    provider: string;
    paymentUrl?: string;
    snapToken?: string;
    expiresAt?: string;
    createdAt?: string;
}

const getPaymentCacheKey = (orderId: string) => `payment_cache_${orderId}`;
const normalizePayment = (payload: any): PaymentDetail => ({
    id: payload.id,
    status: payload.status,
    amount: Number(payload.amount ?? 0),
    provider: payload.provider,
    paymentUrl:
        payload.paymentUrl || payload.payment_url || payload.payloadJson?.paymentUrl || payload.payload_json?.paymentUrl,
    snapToken:
        payload.snapToken || payload.snap_token || payload.payloadJson?.snapToken || payload.payload_json?.snapToken,
    expiresAt:
        payload.expiresAt || payload.expires_at || payload.payloadJson?.expiresAt || payload.payload_json?.expiresAt,
    createdAt: payload.createdAt || payload.created_at,
});

const paidOrderStatuses = new Set([
    'READY_TO_DELIVER',
    'DELIVERING_TO_CUSTOMER',
    'RECEIVED_BY_CUSTOMER',
]);

const paidPaymentStatuses = new Set(['PAID', 'SETTLEMENT', 'CAPTURE', 'SUCCESS']);
const failedPaymentStatuses = new Set(['FAILED', 'EXPIRED', 'REFUNDED']);

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params?.orderId as string | undefined;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [payment, setPayment] = useState<PaymentDetail | null>(null);
    const [loadingOrder, setLoadingOrder] = useState(false);
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [creatingPayment, setCreatingPayment] = useState(false);
    const [snapReady, setSnapReady] = useState(false);
    const [snapError, setSnapError] = useState<string | null>(null);
    const [paymentDeadline, setPaymentDeadline] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const paymentInitRef = useRef(false);

    useEffect(() => {
        if (!orderId) {
            return;
        }
        const loadOrder = async () => {
            setLoadingOrder(true);
            try {
                const response = await axiosInstance.get(`/orders/${orderId}`);
                const payload = response?.data?.data ?? response?.data;
                if (payload) {
                    const normalizedOrder: OrderDetail = {
                        id: payload.id,
                        orderNumber:
                            payload.orderNumber || payload.orderNo || payload.invoiceNumber || payload.id,
                        status: payload.status,
                        totalAmount:
                            payload.totalAmount ?? payload.totalPrice ?? payload.total ?? 0,
                        outletName: payload.outletName || payload.outlet?.name,
                        createdAt: payload.createdAt,
                    };
                    setOrder(normalizedOrder);
                    if (paidOrderStatuses.has(normalizedOrder.status)) {
                        router.replace(`/payments/finish?orderId=${orderId}`);
                    }
                }
            } catch (error: any) {
                const message = error?.response?.data?.message || 'Failed to load order.';
                toast.error(message);
            } finally {
                setLoadingOrder(false);
            }
        };
        loadOrder();
    }, [orderId]);

    const loadLatestPayment = async () => {
        if (!orderId) {
            return false;
        }
        try {
            setLoadingPayment(true);
            const response = await axiosInstance.get(`/payments/order/${orderId}`);
            const payload = response?.data?.data ?? [];
            const list = Array.isArray(payload) ? payload : [payload];
            if (list.length > 0) {
                const normalizedList = list.map(normalizePayment);
                const latest = normalizedList.sort((a, b) => {
                    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    if (aTime && bTime) {
                        return bTime - aTime;
                    }
                    return Number(b.id) - Number(a.id);
                })[0];
                if (typeof window !== 'undefined') {
                    const cachedRaw = window.localStorage.getItem(getPaymentCacheKey(orderId));
                    if (cachedRaw) {
                        const cached = JSON.parse(cachedRaw) as Partial<PaymentDetail>;
                        if (!latest.snapToken && cached.snapToken) {
                            latest.snapToken = cached.snapToken;
                        }
                        if (!latest.paymentUrl && cached.paymentUrl) {
                            latest.paymentUrl = cached.paymentUrl;
                        }
                    }
                    const cachePayload = {
                        snapToken: latest.snapToken,
                        paymentUrl: latest.paymentUrl,
                    };
                    window.localStorage.setItem(getPaymentCacheKey(orderId), JSON.stringify(cachePayload));
                }
                setPayment(latest);
                return true;
            }
        } catch (error: any) {
            const message = error?.response?.data?.message;
            if (message) {
                console.warn('Failed to load latest payment:', message);
            }
        } finally {
            setLoadingPayment(false);
        }
        return false;
    };

    const createPayment = async (options?: { autoOpen?: boolean }) => {
        if (!orderId) {
            return;
        }
        setCreatingPayment(true);
        try {
            const response = await axiosInstance.post('/payments', {
                orderId,
            });
            const payload = response?.data?.data;
            if (payload) {
                const normalized = normalizePayment(payload);
                setPayment(normalized);
                if (typeof window !== 'undefined') {
                    const cachePayload = {
                        snapToken: normalized.snapToken,
                        paymentUrl: normalized.paymentUrl,
                    };
                    window.localStorage.setItem(getPaymentCacheKey(orderId), JSON.stringify(cachePayload));
                }
                if (options?.autoOpen) {
                    if (normalized.snapToken && window.snap) {
                        window.snap.pay(normalized.snapToken, getSnapHandlers());
                    } else if (normalized.paymentUrl) {
                        openPaymentUrl(normalized.paymentUrl);
                    }
                }
            }
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Failed to create payment.';
            if (message.toLowerCase().includes('pending')) {
                const hasExisting = await loadLatestPayment();
                if (hasExisting) {
                    toast.info('Existing pending payment found. Please continue the payment.');
                    return;
                }
            }
            toast.error(message);
        } finally {
            setCreatingPayment(false);
        }
    };

    useEffect(() => {
        if (!orderId || paymentInitRef.current) {
            return;
        }
        paymentInitRef.current = true;
        loadLatestPayment();
    }, [orderId]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        if (window.snap) {
            setSnapReady(true);
            return;
        }

        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
        if (!clientKey) {
            setSnapError('Missing Midtrans client key.');
            return;
        }

        const scriptId = 'midtrans-snap-script';
        const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (existingScript) {
            existingScript.addEventListener('load', () => setSnapReady(true));
            existingScript.addEventListener('error', () => setSnapError('Failed to load Midtrans Snap.'));
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', clientKey);
        script.onload = () => setSnapReady(true);
        script.onerror = () => setSnapError('Failed to load Midtrans Snap.');
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        if (!payment?.createdAt || paidPaymentStatuses.has(payment.status)) {
            setTimeRemaining('');
            return;
        }

        const deadline = new Date(new Date(payment.createdAt).getTime() + 24 * 60 * 60 * 1000);
        setPaymentDeadline(deadline.toISOString());

        const updateCountdown = () => {
            const now = new Date();
            const remaining = deadline.getTime() - now.getTime();

            if (remaining <= 0) {
                setTimeRemaining('EXPIRED');
                return;
            }

            const hours = Math.floor(remaining / (60 * 60 * 1000));
            const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
            const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

            setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [payment?.createdAt, payment?.status]);

    const getSnapHandlers = () => ({
        onSuccess: () => {
            toast.success('Payment success.');
            router.push(`/payments/finish?orderId=${orderId}`);
        },
        onPending: () => {
            toast.info('Payment pending.');
            router.push(`/payments/finish?orderId=${orderId}`);
        },
        onError: () => {
            toast.error('Payment failed.');
            router.push(`/payments/finish?orderId=${orderId}`);
        },
        onClose: () => {
            toast.message('Payment popup closed.');
        },
    });

    const openPaymentUrl = (url: string) => {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (!newWindow) {
            window.location.href = url;
        }
    };

    const handlePayNow = async () => {
        if (payment && paidPaymentStatuses.has(payment.status)) {
            router.push(`/payments/finish?orderId=${orderId}`);
            return;
        }
        if (payment && payment.status === 'PENDING') {
            if (payment.snapToken && window.snap) {
                window.snap.pay(payment.snapToken, getSnapHandlers());
                return;
            }
            if (payment.paymentUrl) {
                openPaymentUrl(payment.paymentUrl);
                return;
            }
            toast.info('Payment is pending but the payment link is not available on this device.');
            return;
        }
        if (!payment || failedPaymentStatuses.has(payment.status)) {
            await createPayment({ autoOpen: true });
            return;
        }
        if (payment.snapToken && window.snap) {
            window.snap.pay(payment.snapToken, getSnapHandlers());
            return;
        }
        if (payment.paymentUrl) {
            openPaymentUrl(payment.paymentUrl);
            return;
        }
        await createPayment({ autoOpen: true });
    };

    const handleCreateNewPayment = async () => {
        await createPayment({ autoOpen: true });
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

            <main className="flex-1">
                <div className="bg-gradient-to-r from-[#1dacbc] to-[#14939e] text-white py-10">
                    <div className="container mx-auto px-4">
                        <h1 className="text-3xl md:text-4xl font-bold">Payment</h1>
                        <p className="text-teal-50 text-sm mt-1">Complete payment securely with Midtrans</p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-10 space-y-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
                        {loadingOrder ? (
                            <p className="text-sm text-gray-500">Loading order...</p>
                        ) : order ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Order Number</p>
                                    <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Outlet</p>
                                    <p className="font-semibold text-gray-800">{order.outletName || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Total</p>
                                    <p className="font-semibold text-[#1dacbc]">{formatRupiah(order.totalAmount)}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Order not found.</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-800">Midtrans Snap</h2>
                                <span className="text-xs font-semibold px-2 py-1 rounded bg-[#e8faf7] text-[#14939e]">Sandbox</span>
                            </div>
                            <div className="space-y-4">
                                <div className="text-xs text-gray-600 space-y-1">
                                    <p><span className="font-medium">Status:</span> {payment?.status || '-'}</p>
                                    <p><span className="font-medium">Amount:</span> {payment ? formatRupiah(payment.amount) : '-'}</p>
                                    {payment?.expiresAt && <p><span className="font-medium">Expires:</span> {new Date(payment.expiresAt).toLocaleString('id-ID')}</p>}
                                </div>
                                {timeRemaining && !paidPaymentStatuses.has(payment?.status || '') && (
                                    <div className={`text-xs font-semibold px-3 py-2 rounded ${
                                        timeRemaining === 'EXPIRED'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        ⏱️ Payment expires in: {timeRemaining}
                                    </div>
                                )}
                                {snapError && (
                                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                        {snapError}
                                    </div>
                                )}
                                <div className="space-y-2 text-xs text-gray-600">
                                    <p>Midtrans Snap will show all available payment methods in the sandbox.</p>
                                    <p>If you cancel the popup, you can create a new payment to get a fresh token.</p>
                                    {!snapReady && !snapError && (
                                        <p>Loading Midtrans gateway...</p>
                                    )}
                                    {(creatingPayment || loadingPayment) && (
                                        <p className="text-[#1dacbc]">⏳ Preparing payment gateway...</p>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="button"
                                        onClick={handlePayNow}
                                        disabled={creatingPayment || loadingPayment}
                                        className="px-4 py-2 bg-[#1dacbc] text-white rounded-lg text-sm font-semibold hover:bg-[#14939e] transition disabled:bg-gray-300"
                                    >
                                        {creatingPayment ? 'Preparing...' : 'Pay Now'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreateNewPayment}
                                        disabled={creatingPayment || loadingPayment}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:text-gray-300"
                                    >
                                        Create New Payment
                                    </button>
                                </div>
                                {payment?.paymentUrl && (
                                    <a
                                        href={payment.paymentUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-[#1dacbc] font-semibold hover:underline block text-center"
                                    >
                                        Open payment page in new tab
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Next Steps</h2>
                            <div className="space-y-3 text-sm text-gray-600">
                                <p>Click “Pay Now” to open the Midtrans Snap popup.</p>
                                <p>Choose your payment method inside the sandbox.</p>
                                <p>Need another method? Cancel and create a new payment to get a new token.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => router.push('/check-status')}
                                className="w-full mt-6 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                            >
                                Back to orders
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
