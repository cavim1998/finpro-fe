"use client";

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';

const VerifyEmailPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromParams = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailFromParams);
    const [verificationCode, setVerificationCode] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await axiosInstance.post('/auth/verify-email', {
                email,
                verificationCode,
                password,
            });

            setSuccess('Email verified successfully! Redirecting to login...');
            setTimeout(() => {
                router.push('/signin');
            }, 2000);
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Verification failed. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl text-black font-semibold text-center mb-2">
                    Verify Email
                </h1>
                <p className="text-gray-600 text-center mb-8 text-sm">
                    Enter the verification code sent to your email
                </p>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-green-700 text-sm">{success}</p>
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border text-black border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14939e]"
                            required
                        />
                    </div>

                    {/* Verification Code */}
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Verification Code (6 digits)</label>
                        <input
                            type="text"
                            placeholder="123456"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            className="w-full border text-black border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14939e]"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Password (min 8 characters)</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border text-black border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14939e]"
                            required
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1dacbc] text-white py-3 rounded-full font-medium hover:bg-[#14939e] transition disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                {/* Resend Code Link */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Didn&apos;t receive code?{" "}
                    <a href="/resend-verification" className="text-[#1dacbc] hover:underline">
                        Resend Verification
                    </a>
                </p>

                {/* Back to Sign In */}
                <p className="text-center text-sm text-gray-500 mt-4">
                    Already verified?{" "}
                    <a href="/signin" className="text-[#1dacbc] hover:underline">
                        Sign In
                    </a>
                </p>
            </div>
        </div>
    )
}

export default VerifyEmailPage
