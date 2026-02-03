'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { axiosInstance } from '@/lib/axios';

export default function ConfirmResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Reset token is missing or invalid');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.put('/auth/reset-password', {
                token,
                password,
            });
            setSuccess(true);
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to reset password. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            
            <div className="grow">
                {/* Hero Section */}
                <div className="bg-linear-to-r from-[#1dacbc] to-[#14939e] text-white py-12">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold">Create New Password</h1>
                        <p className="text-[#e8faf7] text-lg mt-2">Enter your new password below</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-8">
                            {!success ? (
                                <>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Error Message */}
                                        {error && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                                <p className="text-red-600 text-sm">{error}</p>
                                            </div>
                                        )}

                                        {/* Password Field */}
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">New Password</label>
                                            <div className="relative">
                                                <input 
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    placeholder="Enter new password"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1dacbc] pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-2.5 text-gray-500"
                                                >
                                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
                                        </div>

                                        {/* Confirm Password Field */}
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
                                            <div className="relative">
                                                <input 
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    placeholder="Confirm new password"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1dacbc] pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-2.5 text-gray-500"
                                                >
                                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="w-full bg-[#1dacbc] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#14939e] transition disabled:opacity-50 mt-6"
                                        >
                                            {loading ? 'Setting Password...' : 'Set New Password'}
                                        </button>
                                    </form>

                                    {/* Back to Login */}
                                    <div className="mt-6 text-center">
                                        <Link href="/signin" className="text-[#1dacbc] font-semibold hover:underline text-sm">
                                            Back to Sign In
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Success Message */}
                                    <div className="text-center">
                                        <div className="inline-block bg-green-100 rounded-full p-4 mb-4">
                                            <span className="text-green-600 text-3xl">✓</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset Successful</h2>
                                        <p className="text-gray-600 mb-6">
                                            Your password has been successfully reset. You can now login with your new password.
                                        </p>

                                        <Link 
                                            href="/signin"
                                            className="w-full bg-[#1dacbc] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#14939e] transition inline-block"
                                        >
                                            Go to Sign In
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
