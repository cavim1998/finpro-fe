"use client";

import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';
import Cookies from 'js-cookie';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const page = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleGoogleSignup = async (credential: string | undefined) => {
        if (!credential) {
            setError('Google sign up failed. Please try again.');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Decode ID token untuk extract user info (sesuai diagram)
            const decoded: any = jwtDecode(credential);
            console.log('Decoded Google token for signup:', {
                email: decoded.email,
                name: decoded.name,
                picture: decoded.picture,
                email_verified: decoded.email_verified
            });

            // Kirim ke BE - endpoint signup (bukan login)
            const response = await axiosInstance.post('/auth/google/signup', {
                idToken: credential,
            });

            const accessToken = response?.data?.data?.accessToken;
            const user = response?.data?.data?.user;

            console.log('Google signup response:', { accessToken, user });

            if (accessToken) {
                const isProduction = window.location.protocol === 'https:';
                Cookies.set('auth_token', accessToken, { expires: 7, secure: isProduction, sameSite: 'strict' });
                if (user) {
                    Cookies.set('user_data', JSON.stringify(user), { expires: 7, secure: isProduction, sameSite: 'strict' });
                }
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('user-data-updated'));
                }
                
                // Google signup berhasil, user sudah auto-verified
                router.push('/profile');
            }
        } catch (err: any) {
            const message = err?.response?.data?.message || '';
            const status = err?.response?.status;
            
            console.error('Google signup error - Full error:', err);
            console.error('Google signup error - Response:', err?.response);
            console.error('Google signup error - Data:', err?.response?.data);
            console.error('Google signup error - Status:', status);
            console.error('Google signup error - Message:', message);
            
            // Jika user sudah terdaftar, suruh login (sesuai diagram)
            if (status === 409 || status === 400 || message.toLowerCase().includes('already exists') || message.toLowerCase().includes('already registered')) {
                setError('This Google account is already registered. Redirecting to sign in...');
                // Redirect ke login setelah 3 detik
                setTimeout(() => {
                    router.push('/signin');
                }, 3000);
            } else {
                setError(message || 'Google sign up failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await axiosInstance.post('/auth/register', {
                name,
                email,
                password: password || undefined,
            });
            setSuccess('Registration successful! Redirecting to verification page...');
            
            // Redirect ke verify-email page setelah 2 detik
            setTimeout(() => {
                router.push(`/signup/verify-email?email=${encodeURIComponent(email)}`);
            }, 2000);
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Registration failed. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl text-black font-semibold text-center mb-8">
                    Create Account
                </h1>

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
                    {/* Name */}
                    <div>
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border text-black border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14939e]"
                        />
                    </div>

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

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1dacbc] text-white py-3 rounded-full font-medium hover:bg-[#14939e] transition"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                {/* Login link */}
                <p className="text-center text-sm text-gray-500 mt-4">
                    Already have an account?{" "}
                    <a href="/signin" className="text-[#1dacbc] hover:underline">
                        Sign In
                    </a>
                </p>

                {/* Divider */}
                <div className="flex items-center my-6 gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Google Signup Button - Custom Styled */}
                <div className="flex justify-center">
                    <div className="w-full max-w-xs [&>div]:w-full [&_button]:w-full [&_button]:justify-center [&_button]:gap-3 [&_button]:px-6 [&_button]:py-3 [&_button]:bg-white [&_button]:border [&_button]:border-gray-300 [&_button]:rounded-lg [&_button]:hover:bg-gray-50 [&_button]:transition">
                        <GoogleLogin
                            onSuccess={(credentialResponse) =>
                                handleGoogleSignup(credentialResponse.credential)
                            }
                            onError={() => setError('Google sign up failed. Please try again.')}
                            useOneTap={false}
                            text="signup_with"
                            width="100%"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page