'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { axiosInstance } from '@/lib/axios';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axiosInstance.post('/auth/forgot-password', { email });
            setSubmitted(true);
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to send reset link. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            
            <div className="flex-grow">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-[#1dacbc] to-[#14939e] text-white py-12">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold">Reset Password</h1>
                        <p className="text-[#e8faf7] text-lg mt-2">We'll send you a link to reset your password</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-8">
                            {!submitted ? (
                                <>
                                    <p className="text-gray-600 mb-6">
                                        Enter the email address associated with your account. We'll send you a link to reset your password.
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {error && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                <p className="text-red-600 text-sm">{error}</p>
                                            </div>
                                        )}
                                        {/* Email Field */}
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
                                            <input 
                                                type="email" 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                placeholder="your@email.com"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1dacbc]"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="w-full bg-[#1dacbc] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#14939e] transition disabled:opacity-50"
                                        >
                                            {loading ? 'Sending...' : 'Send Reset Link'}
                                        </button>
                                    </form>

                                    {/* Back to Login */}
                                    <div className="mt-6 text-center">
                                        <p className="text-gray-600">
                                            Remember your password? <Link href="/signin" className="text-[#1dacbc] font-semibold hover:underline">Sign In</Link>
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Success Message */}
                                    <div className="text-center">
                                        <div className="inline-block bg-green-100 rounded-full p-4 mb-4">
                                            <span className="text-green-600 text-3xl">✓</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
                                        <p className="text-gray-600 mb-2">
                                            We've sent a password reset link to <strong>{email}</strong>
                                        </p>
                                        <p className="text-sm text-gray-500 mb-6">
                                            The link will expire in 1 hour. If you don't see the email, check your spam folder.
                                        </p>

                                        {/* Resend Link */}
                                        <button 
                                            onClick={() => {
                                                setSubmitted(false);
                                                setEmail('');
                                            }}
                                            className="text-[#1dacbc] font-semibold hover:underline text-sm mb-4"
                                        >
                                            Didn't receive an email? Try another address
                                        </button>

                                        <div className="border-t border-gray-200 pt-4 mt-4">
                                            <Link href="/signin" className="text-[#1dacbc] font-semibold hover:underline">
                                                Back to Sign In
                                            </Link>
                                        </div>
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
