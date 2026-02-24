'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTshirt } from 'react-icons/fa';
import { addressService } from '@/services/addressService';
import { axiosInstance } from '@/lib/axios';
import { OutletListTypes } from '@/types/outlet';
import { Address } from '@/types/address';
import { toast } from 'sonner';
import { sortOutletsByDistance } from '@/lib/distance';

export default function ReservationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [outlets, setOutlets] = useState<OutletListTypes[]>([]);
    const [sortedOutlets, setSortedOutlets] = useState<Array<OutletListTypes & { distance?: number }>>([]);
    const [selectedOutletId, setSelectedOutletId] = useState<number | null>(null);
    const [showAllOutlets, setShowAllOutlets] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        outletId: null as number | null,
        pickupDate: '',
        pickupTime: '',
        serviceType: 'regular',
        specialInstructions: ''
    });

    useEffect(() => {
        const userCookie = Cookies.get('user_data');
        if (!userCookie) {
            router.push('/signin');
            return;
        }
        
        try {
            const user = JSON.parse(userCookie);
            setUserData(user);
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                phone: user.phone || '',
            }));
            
            // Load user's saved addresses
            loadAddresses();
            loadOutlets();
        } catch (error) {
            console.error('Error parsing user data:', error);
            router.push('/signin');
        }
        setLoading(false);
    }, [router]);

    const loadAddresses = async () => {
        try {
            const data = await addressService.getAll();
            setAddresses(data);
            
            // Auto-select primary address if exists, or first address
            const primaryAddress = data.find(addr => addr.isPrimary);
            if (primaryAddress) {
                handleAddressSelect(primaryAddress.id.toString());
            } else if (data.length > 0) {
                handleAddressSelect(data[0].id.toString());
            }
        } catch (error) {
            console.error('Failed to load addresses:', error);
        }
    };

    const loadOutlets = async () => {
        try {
            const response = await axiosInstance.get('/outlets');
            let data = response.data;
            if (data && typeof data === 'object' && 'data' in data) {
                data = data.data;
            }
            const outletArray = Array.isArray(data) ? data : [];
            setOutlets(outletArray);
            
            // If address is already selected, sort outlets by distance
            if (selectedAddressId && addresses.length > 0) {
                const selectedAddr = addresses.find(a => a.id === selectedAddressId);
                if (selectedAddr && selectedAddr.latitude && selectedAddr.longitude) {
                    const sorted = sortOutletsByDistance(outletArray, selectedAddr.latitude, selectedAddr.longitude);
                    setSortedOutlets(sorted as Array<OutletListTypes & { distance?: number }>);
                    return;
                }
            }
            
            // Otherwise just set them as is
            setSortedOutlets(outletArray as Array<OutletListTypes & { distance?: number }>);
            
            // Auto-select first active outlet
            if (outletArray.length > 0) {
                const activeOutlet = outletArray.find(o => o.isActive) || outletArray[0];
                handleOutletSelect(activeOutlet.id);
            }
        } catch (error) {
            console.error('Failed to load outlets:', error);
        }
    };

    const handleAddressSelect = (addressId: string) => {
        const selected = addresses.find(addr => addr.id === parseInt(addressId));
        if (selected) {
            setSelectedAddressId(selected.id);
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
        const selected = outlets.find(outlet => outlet.id === outletId);
        if (selected) {
            setSelectedOutletId(outletId);
            setFormData(prev => ({
                ...prev,
                outletId: outletId
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const buildScheduledPickupAt = (pickupDate: string, pickupTime: string) => {
        if (!pickupDate || !pickupTime) {
            return null;
        }
        const timeStart = pickupTime.split('-')[0]?.trim();
        if (!timeStart) {
            return null;
        }
        const localDateTime = new Date(`${pickupDate}T${timeStart}:00`);
        if (Number.isNaN(localDateTime.getTime())) {
            return null;
        }
        return localDateTime.toISOString();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAddressId) {
            toast.error('Please select a pickup address');
            return;
        }
        const scheduledPickupAt = buildScheduledPickupAt(formData.pickupDate, formData.pickupTime);
        if (!scheduledPickupAt) {
            toast.error('Please select a valid pickup date and time');
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1dacbc] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
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
                                                        className={`p-4 border-2 rounded-lg transition cursor-pointer ${
                                                            selectedOutletId === outlet.id
                                                                ? 'border-[#1dacbc] bg-blue-50 shadow-md'
                                                                : 'border-gray-300 hover:border-[#1dacbc] hover:shadow-md'
                                                        }`}
                                                    >
                                                        <div className="font-semibold text-gray-800 mb-2">{outlet.name}</div>
                                                        <div className="text-sm text-gray-600 mb-2">📍 {outlet.addressText}</div>
                                                        <div className="text-sm text-gray-600 mb-2">📏 Radius: {outlet.serviceRadiusKm} km</div>
                                                        {outlet.distance !== undefined && (
                                                            <div className="text-sm font-semibold text-[#1dacbc] mb-2">
                                                                📍 Distance: {outlet.distance} km
                                                            </div>
                                                        )}
                                                        {outlet.staffCount !== undefined && (
                                                            <div className="text-sm text-gray-600">👥 {outlet.staffCount} staff</div>
                                                        )}
                                                        {selectedOutletId === outlet.id && (
                                                            <div className="mt-3 text-sm font-semibold text-[#1dacbc]">
                                                                ✓ Terpilih
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-2">
                                            <FaCalendarAlt className="inline mr-2 text-[#1dacbc]" />
                                            Pickup Date *
                                        </label>
                                        <input
                                            type="date"
                                            id="pickupDate"
                                            name="pickupDate"
                                            value={formData.pickupDate}
                                            onChange={handleChange}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1dacbc] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700 mb-2">
                                            <FaClock className="inline mr-2 text-[#1dacbc]" />
                                            Pickup Time *
                                        </label>
                                        <select
                                            id="pickupTime"
                                            name="pickupTime"
                                            value={formData.pickupTime}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1dacbc] focus:border-transparent"
                                        >
                                            <option value="">Select time</option>
                                            <option value="08:00-10:00">08:00 - 10:00</option>
                                            <option value="10:00-12:00">10:00 - 12:00</option>
                                            <option value="12:00-14:00">12:00 - 14:00</option>
                                            <option value="14:00-16:00">14:00 - 16:00</option>
                                            <option value="16:00-18:00">16:00 - 18:00</option>
                                        </select>
                                    </div>
                                </div>
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

