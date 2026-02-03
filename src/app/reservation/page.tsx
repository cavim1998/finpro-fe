'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaWeightHanging, FaTshirt } from 'react-icons/fa';

export default function ReservationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        pickupDate: '',
        pickupTime: '',
        serviceType: 'regular',
        estimatedWeight: '3',
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
                address: user.address || ''
            }));
        } catch (error) {
            console.error('Error parsing user data:', error);
            router.push('/signin');
        }
        setLoading(false);
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement API call to create reservation
        console.log('Reservation data:', formData);
        alert('Reservation submitted! (API integration pending)');
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
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                        <FaMapMarkerAlt className="inline mr-2 text-[#1dacbc]" />
                                        Pickup Address *
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1dacbc] focus:border-transparent"
                                        placeholder="Enter your complete pickup address"
                                    />
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            <option value="express">Express Wash (1 day)</option>
                                            <option value="premium">Premium Care (3-4 days)</option>
                                            <option value="dry-clean">Dry Clean (4-5 days)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="estimatedWeight" className="block text-sm font-medium text-gray-700 mb-2">
                                            <FaWeightHanging className="inline mr-2 text-[#1dacbc]" />
                                            Estimated Weight (kg) *
                                        </label>
                                        <input
                                            type="number"
                                            id="estimatedWeight"
                                            name="estimatedWeight"
                                            value={formData.estimatedWeight}
                                            onChange={handleChange}
                                            required
                                            min="3"
                                            step="0.5"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1dacbc] focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Minimum 3kg</p>
                                    </div>
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

                            {/* Pricing Info */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Estimated Price</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Regular Wash:</span>
                                        <span className="font-medium">Rp 7,000 / kg</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Express Wash:</span>
                                        <span className="font-medium">Rp 10,000 / kg</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Premium Care:</span>
                                        <span className="font-medium">Rp 12,000 / kg</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Dry Clean:</span>
                                        <span className="font-medium">Starting from Rp 25,000 / item</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-4">
                                    * Final price will be calculated based on actual weight
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center pt-6">
                                <button
                                    type="submit"
                                    className="bg-linear-to-r from-[#1dacbc] to-[#14939e] text-white px-12 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    Confirm Reservation
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
