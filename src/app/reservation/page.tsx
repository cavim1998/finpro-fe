'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTshirt } from 'react-icons/fa';
import { addressService } from '@/services/addressService';
import { axiosInstance } from '@/lib/axios';
import { OutletListTypes } from '@/types/outlet';
import { Address } from '@/types/address';
import { toast } from 'sonner';
import { sortOutletsByDistance } from '@/lib/distance';
import { Loader2 } from 'lucide-react';

export default function ReservationPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [outlets, setOutlets] = useState<OutletListTypes[]>([]);
    const [sortedOutlets, setSortedOutlets] = useState<Array<OutletListTypes & { distance?: number }>>([]);
    const [selectedOutletId, setSelectedOutletId] = useState<number | null>(null);
    const [showAllOutlets, setShowAllOutlets] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [dataloaded, setDataLoaded] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        outletId: null as number | null,
        serviceType: 'regular',
        specialInstructions: '',
        scheduledPickupAt: ''
    });

    // Auth check
    useEffect(() => {
        if (status === 'unauthenticated') {
            setLoading(false);
            router.push('/signin');
        } else if (status === 'authenticated' && session?.user) {
            setUserData(session.user);
            setFormData(prev => ({
                ...prev,
                name: session.user.name || '',
                phone: session.user.phone || '',
            }));
        }
    }, [status, session, router]);

    // Load data when authenticated
    useEffect(() => {
        if (status === 'authenticated' && !dataloaded) {
            (async () => {
                try {
                    // Load addresses and outlets in parallel
                    const [addressesData, outletsResponse] = await Promise.all([
                        addressService.getAll(),
                        axiosInstance.get('/outlets')
                    ]);

                    // Process addresses
                    setAddresses(addressesData);

                    // Process outlets
                    let outletArray = outletsResponse.data;
                    if (outletArray && typeof outletArray === 'object' && 'data' in outletArray) {
                        outletArray = outletArray.data;
                    }
                    outletArray = Array.isArray(outletArray) ? outletArray : [];
                    setOutlets(outletArray);
                    setSortedOutlets(outletArray as Array<OutletListTypes & { distance?: number }>);

                    // Outlets will be auto-selected when user picks an address
                    // For now, just show the list without selection

                    setDataLoaded(true);
                    setLoading(false);
                } catch (error) {
                    console.error('Failed to load data:', error);
                    setLoading(false);
                }
            })();
        }
    }, [status, dataloaded]);

    const handleAddressSelect = (addressId: string) => {
        const addressIdNum = parseInt(addressId);
        setSelectedAddressId(addressIdNum);

        const selected = addresses.find(addr => addr.id === addressIdNum);
        if (selected) {
            setFormData(prev => ({
                ...prev,
                address: `${selected.addressText}\n\nPenerima: ${selected.receiverName}\nTelepon: ${selected.receiverPhone}`
            }));

            // Calculate distances to all outlets if address has coordinates
            if (selected.latitude && selected.longitude && outlets.length > 0) {
                const sorted = sortOutletsByDistance(outlets, selected.latitude, selected.longitude);
                setSortedOutlets(sorted as Array<OutletListTypes & { distance?: number }>);
                setShowAllOutlets(false);

                // Auto-select the closest outlet
                if (sorted.length > 0) {
                    handleOutletSelect(sorted[0].id);
                }
            }
        }
    };

    const handleOutletSelect = (outletId: number) => {
        setSelectedOutletId(outletId);
        setFormData(prev => ({
            ...prev,
            outletId: outletId
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const formatDateTimeLocal = (date: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const parseScheduledPickupLocal = (value: string) => {
        if (!value) return null;
        const [datePart, timePart] = value.split('T');
        if (!datePart || !timePart) return null;

        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        if ([year, month, day, hour, minute].some(Number.isNaN)) return null;

        return new Date(year, month - 1, day, hour, minute, 0, 0);
    };

    const applyPresetTime = (hour: number) => {
        const baseDate = formData.scheduledPickupAt ? new Date(formData.scheduledPickupAt) : new Date();
        if (Number.isNaN(baseDate.getTime())) return;

        baseDate.setHours(hour, 0, 0, 0);
        const now = new Date();
        if (baseDate <= now) {
            baseDate.setDate(baseDate.getDate() + 1);
        }

        setFormData(prev => ({
            ...prev,
            scheduledPickupAt: formatDateTimeLocal(baseDate),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAddressId) {
            toast.error('Please select a pickup address');
            return;
        }
        
        // Validate datetime-local input
        if (!formData.scheduledPickupAt) {
            toast.error('Please select a valid pickup date and time');
            return;
        }

        // Convert datetime-local to ISO timestamp
        const scheduledPickupAt = new Date(formData.scheduledPickupAt).toISOString();
        
        // Validate: pickup time must be in the future
        const now = new Date();
        const pickupTime = new Date(formData.scheduledPickupAt);
        if (pickupTime <= now) {
            toast.error('Pickup time must be in the future');
            return;
        }

        // Validate: working hours (8 AM - 6 PM)
        const hour = pickupTime.getHours();
        const minute = pickupTime.getMinutes();
        if (hour < 8 || hour > 18 || (hour === 18 && minute > 0)) {
            toast.error('Pickup time must be between 08:00 and 18:00');
            return;
        }

        const outletName = outlets.find(outlet => outlet.id === selectedOutletId)?.name;
        const notesParts = [formData.specialInstructions?.trim(), `Service: ${formData.serviceType}`];
        if (outletName) {
            notesParts.push(`Outlet Preference: ${outletName}`);
        }
        const notes = notesParts.filter(Boolean).join('\n');

        setSubmitting(true);
        try {
            await axiosInstance.post('/pickup-requests', {
                addressId: selectedAddressId,
                scheduledPickupAt,
                notes: notes || undefined,
            });
            toast.success('Pickup request created successfully');

            // Redirect to check-status page after 1 second
            setTimeout(() => {
                router.push('/check-status');
            }, 1000);
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Failed to create pickup request';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-[#1dacbc] animate-spin mb-4" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9f9f9]">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-linear-to-r from-[#1dacbc] to-[#14939e] text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        Book Your Laundry Service
                    </h1>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
                        Schedule a pickup and let us take care of the rest
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h2 className="text-2xl font-bold text-[#1dacbc] mb-6">
                                    Personal Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1dacbc] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1dacbc] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <label htmlFor="addressSelect" className="block text-sm font-medium text-gray-700 mb-2">
                                        <FaMapMarkerAlt className="inline mr-2 text-[#1dacbc]" />
                                        Pickup Address *
                                    </label>

                                    {/* Address Selector */}
                                    {addresses.length > 0 ? (
                                        <>
                                            <select
                                                id="addressSelect"
                                                value={selectedAddressId || ''}
                                                onChange={(e) => handleAddressSelect(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1dacbc] focus:border-transparent mb-3 appearance-none bg-white"
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                                                    backgroundPosition: 'right 1rem center',
                                                    backgroundRepeat: 'no-repeat',
                                                }}
                                            >
                                                <option value="" disabled>Pilih alamat</option>
                                                {addresses.map((addr) => (
                                                    <option key={addr.id} value={addr.id}>
                                                        {addr.label ? `${addr.label} - ` : ''}{addr.addressText.substring(0, 50)}{addr.addressText.length > 50 ? '...' : ''}
                                                        {addr.isPrimary ? ' (Utama)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            {selectedAddressId && formData.address && (
                                                <textarea
                                                    id="address"
                                                    name="address"
                                                    value={formData.address}
                                                    readOnly
                                                    rows={4}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm text-yellow-800 font-semibold mb-2">
                                                ⚠️ Anda belum memiliki alamat tersimpan
                                            </p>
                                            <p className="text-sm text-yellow-700 mb-3">
                                                Please add an address first in the profile page to continue with the order.
                                            </p>
                                            <a
                                                href="/profile#addresses"
                                                className="inline-block px-4 py-2 bg-[#1dacbc] text-white rounded-lg font-semibold hover:bg-[#14939e] transition text-sm"
                                            >
                                                + Add Address
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Outlet Selection */}
                            <div>
                                <h2 className="text-2xl font-bold text-[#1dacbc] mb-6">
                                    Choose Outlet
                                </h2>
                                <div>
                                    <label htmlFor="outlet" className="block text-sm font-medium text-gray-700 mb-3">
                                        Select Outlet *
                                    </label>
                                    {outlets.length > 0 ? (
                                        <div>
                                            {/* Display Top 3 Outlets or All based on toggle */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                                {(showAllOutlets ? sortedOutlets : sortedOutlets.slice(0, 3)).map((outlet) => (
                                                    <div
                                                        key={outlet.id}
                                                        onClick={() => handleOutletSelect(outlet.id)}
                                                        className={`p-4 border-2 rounded-lg transition cursor-pointer ${selectedOutletId === outlet.id
                                                            ? 'border-[#1dacbc] bg-blue-50 shadow-md'
                                                            : 'border-gray-300 hover:border-[#1dacbc] hover:shadow-md'
                                                            }`}
                                                    >
                                                        <div className="font-semibold text-gray-800 mb-2">{outlet.name}</div>
                                                        <div className="text-sm text-gray-600 mb-2">🏠 {outlet.addressText}</div>
                                                        <div className="text-sm text-gray-600 mb-2">🌆 {outlet.locationCategory}</div>
                                                        <div className="text-sm text-gray-600 mb-2"></div>
                                                        {outlet.distance !== undefined && (
                                                            <div className="text-sm font-semibold text-[#1dacbc] mb-2">
                                                                📏 Distance: {outlet.distance} km
                                                            </div>
                                                        )}
                                                        {outlet.staffCount !== undefined && (
                                                            <div className="text-sm text-gray-600">👥 {outlet.staffCount} staff</div>
                                                        )}
                                                        {selectedOutletId === outlet.id && (
                                                            <div className="mt-3 text-sm font-semibold text-[#1dacbc]">
                                                                ✔️ Terpilih
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* View All Button */}
                                            {sortedOutlets.length > 3 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAllOutlets(!showAllOutlets)}
                                                    className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition text-sm"
                                                >
                                                    {showAllOutlets ? '▲ Show Top 3' : '▼ View All Outlets (' + sortedOutlets.length + ')'}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm text-yellow-800">
                                                Tidak ada outlet tersedia saat ini
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pickup Schedule */}
                            <div>
                                <h2 className="text-2xl font-bold text-[#1dacbc] mb-6">
                                    Pickup Schedule
                                </h2>
                                
                                {/* Quick Preset Buttons */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Quick Select (Available: 08:00 - 18:00)
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[8, 10, 12, 14, 16, 18].map((hour) => {
                                            const selectedDate = formData.scheduledPickupAt ? new Date(formData.scheduledPickupAt) : null;
                                            const isSelected = !!selectedDate && selectedDate.getHours() === hour && selectedDate.getMinutes() === 0;

                                            return (
                                                <button
                                                    key={hour}
                                                    type="button"
                                                    onClick={() => applyPresetTime(hour)}
                                                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                                        isSelected
                                                            ? 'border-[#1dacbc] bg-[#1dacbc] text-white'
                                                            : 'border-gray-300 hover:border-[#1dacbc] hover:bg-blue-50'
                                                    }`}
                                                >
                                                    {`${String(hour).padStart(2, '0')}:00`}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom DateTime Picker */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FaCalendarAlt className="inline mr-2 text-[#1dacbc]" />
                                        Or Choose Custom Date & Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="scheduledPickupAt"
                                        value={formData.scheduledPickupAt}
                                        onChange={(e) => {
                                            const selectedTime = new Date(e.target.value);
                                            const hour = selectedTime.getHours();
                                            const minute = selectedTime.getMinutes();
                                            
                                            // Validate working hours (8 AM - 6 PM)
                                            if (hour < 8 || hour > 18 || (hour === 18 && minute > 0)) {
                                                toast.error('Please select a time between 08:00 and 18:00');
                                                return;
                                            }
                                            
                                            setFormData(prev => ({ ...prev, scheduledPickupAt: e.target.value }));
                                        }}
                                        required
                                        min={formatDateTimeLocal(new Date())}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1dacbc] focus:border-[#1dacbc]"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">💡 Working hours: 08:00 - 18:00 daily</p>
                                </div>

                                {/* Preview Selected Time */}
                                {(() => {
                                    const previewDate = parseScheduledPickupLocal(formData.scheduledPickupAt);
                                    if (!previewDate) return null;

                                    return (
                                        <div className="mt-4 rounded-xl border border-[#1dacbc]/30 bg-[#e8f8fa] p-4">
                                            <p className="text-sm font-semibold text-[#0f6f78] mb-3">Scheduled Pickup</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <span>📅</span>
                                                    <span className="font-medium">
                                                        {previewDate.toLocaleDateString('id-ID', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <span>🕐</span>
                                                    <span className="font-medium">
                                                        {previewDate.toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Service Details */}
                            <div>
                                <h2 className="text-2xl font-bold text-[#1dacbc] mb-6">
                                    Service Details
                                </h2>
                                <div>
                                    <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                                        <FaTshirt className="inline mr-2 text-[#1dacbc]" />
                                        Service Type *
                                    </label>
                                    <select
                                        id="serviceType"
                                        name="serviceType"
                                        value={formData.serviceType}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1dacbc] focus:border-transparent"
                                    >
                                        <option value="regular">Regular Wash (2-3 days)</option>
                                        <option value="express">Premium Wash (1 day)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Special Instructions */}
                            <div>
                                <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                                    Special Instructions (Optional)
                                </label>
                                <textarea
                                    id="specialInstructions"
                                    name="specialInstructions"
                                    value={formData.specialInstructions}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1dacbc] focus:border-transparent"
                                    placeholder="Any special care instructions for your laundry?"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center pt-6">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-linear-to-r from-[#1dacbc] to-[#14939e] text-white px-12 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    {submitting ? 'Submitting...' : 'Confirm Reservation'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                            <FaCalendarAlt className="mr-2" />
                            Important Information
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-700">
                            <li>• Our driver will contact you 30 minutes before pickup</li>
                            <li>• Please prepare your laundry in a bag or container</li>
                            <li>• Payment will be confirmed after weighing your laundry</li>
                            <li>• Express orders placed after 1:00 PM will be completed the next day</li>
                            <li>• Check our <a href="/terms-and-conditions" className="underline font-medium">Terms & Conditions</a> for more details</li>
                        </ul>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

