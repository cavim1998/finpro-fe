'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { axiosInstance } from '@/lib/axios';
import { formatRupiah } from '@/lib/currency';
import { IoQrCodeOutline } from 'react-icons/io5';

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
    redirectUrl?: string;
    expiresAt?: string;
    qrCode?: string;
    qrImage?: string;
}

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params?.orderId as string | undefined;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [payment, setPayment] = useState<PaymentDetail | null>(null);
    const [loadingOrder, setLoadingOrder] = useState(false);
    const [creatingPayment, setCreatingPayment] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<string>('');
    const paymentInitRef = useRef(false);

    useEffect(() => {
        if (!orderId) {
            return;
        }
        const loadOrder = async () => {
            setLoadingOrder(true);
            try {
                const response = await axiosInstance.get(`/orders/${orderId}`);
                const payload = response?.data?.data;
                if (payload) {
                    setOrder(payload);
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

    const createPayment = async () => {
        if (!orderId) {
            return;
        }
        setCreatingPayment(true);
        try {
            const response = await axiosInstance.post('/payments', {
                orderId,
                provider: 'qris',
            });
            const payload = response?.data?.data;
            if (payload) {
                setPayment(payload);
                
                // Generate dummy QRIS data (simulate payment info)
                const qrisData = `00020101021226670016COM.NOBUBANK.WWW01189360050300000884670214${payload.id}0303UMI51440014ID.CO.QRIS.WWW0215ID10200000000010303UMI5204481253033605802ID5913LaundryQ App6007Jakarta61051234062070703A0163044C4D`;
                setQrCodeData(qrisData);
            }
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Failed to create payment.';
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
        createPayment();
    }, [orderId]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            toast.error('Only JPG, PNG, and GIF files are allowed');
            return;
        }

        if (file.size > 1024 * 1024) {
            toast.error('File size must not exceed 1MB');
            return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUploadProof = async () => {
        if (!payment?.id || !selectedFile) {
            toast.error('Please select a file first.');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('proof', selectedFile);
            await axiosInstance.post(`/payments/${payment.id}/upload-proof`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setCompleted(true);
            toast.success('Payment proof uploaded successfully.');
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Failed to upload payment proof.';
            toast.error(message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

            <main className="flex-1">
                <div className="bg-gradient-to-r from-[#1dacbc] to-[#14939e] text-white py-10">
                    <div className="container mx-auto px-4">
                        <h1 className="text-3xl md:text-4xl font-bold">Payment</h1>
                        <p className="text-teal-50 text-sm mt-1">Scan QRIS and upload your payment proof</p>
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
                                <h2 className="text-lg font-bold text-gray-800">QRIS Payment</h2>
                                <span className="text-xs font-semibold px-2 py-1 rounded bg-[#e8faf7] text-[#14939e]">QRIS</span>
                            </div>
                            {creatingPayment ? (
                                <p className="text-sm text-gray-500">Generating QR...</p>
                            ) : payment ? (
                                <div className="space-y-4">
                                    <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center">
                                        {qrCodeData ? (
                                            <div className="bg-white p-4 rounded-lg border-2 border-[#1dacbc]">
                                                <QRCodeSVG
                                                    value={qrCodeData}
                                                    size={176}
                                                    level="H"
                                                    includeMargin={false}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-44 h-44 border border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-3">
                                                <IoQrCodeOutline className="text-6xl text-gray-400" />
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-3">Scan the QR code with your banking app.</p>
                                        {payment.redirectUrl && (
                                            <a
                                                href={payment.redirectUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-[#1dacbc] font-semibold mt-2 hover:underline"
                                            >
                                                Open payment link
                                            </a>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-1">
                                        <p><span className="font-medium">Status:</span> {payment.status}</p>
                                        <p><span className="font-medium">Amount:</span> {formatRupiah(payment.amount)}</p>
                                        {payment.expiresAt && <p><span className="font-medium">Expires:</span> {new Date(payment.expiresAt).toLocaleString('id-ID')}</p>}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 space-y-2">
                                    <p>Failed to create payment.</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            paymentInitRef.current = false;
                                            setPayment(null);
                                            setQrCodeData('');
                                            createPayment();
                                        }}
                                        className="text-xs font-semibold text-[#1dacbc] hover:text-[#14939e]"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Upload Payment Proof</h2>
                            {completed ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                                    Payment completed. Your order will be processed for delivery.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Payment proof preview"
                                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                        />
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-xs text-gray-500">
                                            Upload your payment proof photo here
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif"
                                        onChange={handleFileChange}
                                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleUploadProof}
                                        disabled={uploading || !selectedFile || !payment?.id}
                                        className="w-full bg-[#1dacbc] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#14939e] transition disabled:opacity-50"
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Proof'}
                                    </button>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => router.push('/check-status')}
                                className="w-full mt-4 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
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
