"use client";

import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { axiosInstance } from '@/lib/axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

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

    const getRoleFromToken = (accessToken?: string) => {
        if (!accessToken) return null;
        try {
            const decoded: any = jwtDecode(accessToken);
            return decoded?.role ?? decoded?.roleCode ?? null;
        } catch {
            return null;
        }
    };

    const routeByRole = (role: string) => {
        if (role === 'SUPER_ADMIN' || role === 'OUTLET_ADMIN') return '/admin';
        if (role === 'DRIVER') return '/attendance?next=/driver';
        if (role === 'WORKER') return '/attendance?next=/worker';
        return '/profile'; // CUSTOMER default
    };

    const redirectAfterLogin = async (userFromResponse: any, accessToken?: string) => {
        // 1) Prioritas: role dari token (paling reliable)
        const roleFromToken = getRoleFromToken(accessToken);
        if (roleFromToken) {
            toast.success('Login successful');
            router.push(routeByRole(roleFromToken));
            return;
        }

        // 2) Fallback: role dari user response atau fetch /users/profile
        let user = userFromResponse;

        if (!user) {
            try {
                const me = await axiosInstance.get('/users/profile');
                user = me.data?.data ?? me.data;
            } catch {
                user = { role: 'CUSTOMER' };
            }
        } else {
            // kalau user ada tapi role-nya kosong, tetap coba fetch profile
            const roleMaybe = getRoleFromUser(user);
            if (!roleMaybe) {
                try {
                    const me = await axiosInstance.get('/users/profile');
                    user = me.data?.data ?? me.data;
                } catch {
                    // keep user as is
                }
            }
        }

        const role = getRoleFromUser(user);
        toast.success('Login successful');
        router.push(routeByRole(role));
    };

    const setAuthCookies = (accessToken: string, user?: any) => {
        const isProduction = window.location.protocol === 'https:';

        Cookies.set('auth_token', accessToken, { expires: 7, secure: isProduction, sameSite: 'strict' });
        if (user) {
            Cookies.set('user_data', JSON.stringify(user), { expires: 7, secure: isProduction, sameSite: 'strict' });
        }
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('user-data-updated'));
        }
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
            // Decode ID token untuk extract user info (sesuai diagram)
            const decoded: any = jwtDecode(credential);
            console.log('Decoded Google token:', {
                email: decoded.email,
                name: decoded.name,
                picture: decoded.picture,
                email_verified: decoded.email_verified
            });

            const response = await axiosInstance.post('/auth/google/login', {
                idToken: credential,
            });

            const accessToken = response?.data?.data?.accessToken;
            const user = response?.data?.data?.user;

            console.log('Google login response:', { accessToken, user });

            if (!accessToken) {
                setError('Google login failed: access token not found.');
                toast.error('Google login failed: access token not found.');
                return;
            }

            setAuthCookies(accessToken, user);
            await redirectAfterLogin(user, accessToken);
        } catch (err: any) {
            // Handle error sesuai diagram - jika user belum terdaftar
            const message = err?.response?.data?.message || '';
            const status = err?.response?.status;

            console.error('Google login error:', { message, status, data: err?.response?.data });

            if (status === 404 || message.toLowerCase().includes('not found') || message.toLowerCase().includes('not registered')) {
                setError('Account not found. Please sign up first with Google.');
                toast.error('Account not found. Please sign up first with Google.');
                // Redirect ke signup setelah 1.2 detik
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
            const response = await axiosInstance.post('/auth/login', {
                email,
                password,
            });

            const accessToken = response?.data?.data?.accessToken;
            const user = response?.data?.data?.user;

            if (!accessToken) {
                setError('Login failed: access token not found.');
                toast.error('Login failed: access token not found.');
                return;
            }

            setAuthCookies(accessToken, user);
            await redirectAfterLogin(user, accessToken);
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Login failed. Please try again.';
            setError(message);
            toast.error(message);
        } finally {
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