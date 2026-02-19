"use client";

import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GoogleLogin } from '@react-oauth/google';
import { signIn } from 'next-auth/react';

const page = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // RoleCode: CUSTOMER | SUPER_ADMIN | OUTLET_ADMIN | WORKER | DRIVER
    const getRoleFromUser = (user: any) => {
        return user?.role ?? user?.roleCode ?? user?.role?.code ?? 'CUSTOMER';
    };

    const routeByRole = (role: string) => {
        if (role === 'SUPER_ADMIN' || role === 'OUTLET_ADMIN') return '/admin';
        if (role === 'DRIVER') return '/attendance?next=/driver';
        if (role === 'WORKER') return '/attendance?next=/worker/washing';
        return '/profile'; // CUSTOMER default
    };

    const handleGoogleLogin = async (credential: string | undefined) => {
        if (!credential) {
            toast.error('Google login failed. Please try again.');
            setError('Google login failed. Please try again.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const result = await signIn('google-id-token', {
                idToken: credential,
                redirect: false,
            });

            if (result?.error) {
                setError('Failed to create session. Please try again.');
                toast.error('Failed to create session. Please try again.');
                return;
            }

            toast.success('Login successful');

            setTimeout(async () => {
                const response = await fetch('/api/auth/session');
                const session = await response.json();
                const role = session?.user?.role || session?.user?.roleCode || 'CUSTOMER';

                router.push(routeByRole(role));
            }, 100);
        } catch (err: any) {
            const message = err?.response?.data?.message || '';
            const status = err?.response?.status;

            console.error('Google login error:', { message, status, data: err?.response?.data });

            if (status === 404 || message.toLowerCase().includes('not found') || message.toLowerCase().includes('not registered')) {
                setError('Account not found. Please sign up first with Google.');
                toast.error('Account not found. Please sign up first with Google.');
                setTimeout(() => {
                    router.push('/signup');
                }, 1200);
            } else {
                setError(message || 'Google login failed. Please try again.');
                toast.error(message || 'Google login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Use NextAuth signIn - it will call our backend via authorize()
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
                toast.error('Invalid email or password');
                setLoading(false);
                return;
            }

            // Login successful! Get session to determine redirect
            // We need to refresh to get the updated session
            toast.success('Login successful');
            
            // Small delay to ensure session is fully established
            setTimeout(async () => {
                // Fetch session to get role
                const response = await fetch('/api/auth/session');
                const session = await response.json();
                const role = session?.user?.role || session?.user?.roleCode || 'CUSTOMER';
                
                router.push(routeByRole(role));
                setLoading(false);
            }, 100);
        } catch (err: any) {
            const message = err?.message || 'Login failed. Please try again.';
            setError(message);
            toast.error(message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl text-black font-semibold text-center mb-8">
                    Sign In
                </h1>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border text-black border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14939e]"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border text-black border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14939e]"
                        />
                    </div>

                    {/* Forgot Password */}
                    <div className="text-right">
                        <a
                            href="/forgot-password"
                            className="text-sm text-[#1dacbc] hover:underline"
                        >
                            Forgot password?
                        </a>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1dacbc] text-white py-3 rounded-full font-medium hover:bg-[#14939e] transition"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-gray-500 mt-4">
                    Don&apos;t have an account?{' '}
                    <a href="/signup" className="text-[#1dacbc] hover:underline">
                        Create Account
                    </a>
                </p>

                {/* Divider */}
                <div className="flex items-center my-6 gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Google Login Button - Custom Styled */}
                <div className="flex justify-center">
                    <div className="w-full max-w-xs [&>div]:w-full [&_button]:w-full [&_button]:justify-center [&_button]:gap-3 [&_button]:px-6 [&_button]:py-3 [&_button]:bg-white [&_button]:border [&_button]:border-gray-300 [&_button]:rounded-lg [&_button]:hover:bg-gray-50 [&_button]:transition">
                        <GoogleLogin
                            onSuccess={(credentialResponse) =>
                                handleGoogleLogin(credentialResponse.credential)
                            }
                            onError={() => {
                                toast.error('Google login failed. Please try again.');
                                setError('Google login failed. Please try again.');
                            }}
                            useOneTap={false}
                            text="signin_with"
                            width="100%"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default page;