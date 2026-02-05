"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { FaCalendarDays } from "react-icons/fa6";

interface UserData {
    id: string;
    name: string;
    email: string;
    profileImage?: string | null;
}

const Navbar = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const loadUserData = useCallback(() => {
        if (typeof window === 'undefined') return;

        const token = Cookies.get('auth_token');
        const userDataStr = Cookies.get('user_data');

        setIsLoggedIn(!!token);

        if (userDataStr) {
            try {
                setUserData(JSON.parse(userDataStr));
            } catch (e) {
                console.error('Failed to parse user data');
            }
        } else {
            setUserData(null);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        loadUserData();

        if (typeof window === 'undefined') return;
        const handleUserDataUpdated = () => loadUserData();

        window.addEventListener('user-data-updated', handleUserDataUpdated);
        return () => {
            window.removeEventListener('user-data-updated', handleUserDataUpdated);
        };
    }, [loadUserData]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        Cookies.remove('auth_token');
        Cookies.remove('user_data');
        setIsLoggedIn(false);
        setUserData(null);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('user-data-updated'));
        }
        router.push('/signin');
    };

    // Generate avatar from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className='container mx-auto'>
            <div className='flex justify-between items-center p-4'>

                {/* Logo */}
                <a href="/">
                    <h1 className='text-4xl font-bold text-[#1dacbc] tracking-tight'>
                        LAUNDRYQ
                    </h1>
                </a>

                <div className='sm:flex items-center gap-4 hidden'>
                    <a href="/" className='text-lg font-semibold text-[#1dacbc] hover:underline underline-offset-4 decoration-2'>Home</a>
                    <a href="/about-us" className='text-lg font-semibold text-[#1dacbc] hover:underline underline-offset-4 decoration-2'>About Us</a>
                    <a href="/outlets" className='text-lg font-semibold text-[#1dacbc] hover:underline underline-offset-4 decoration-2'>Outlet</a>
                    <a href="/check-status" className='text-lg font-semibold text-[#1dacbc] hover:underline underline-offset-4 decoration-2'>Check Status</a>
                    <a href="/terms-and-conditions" className='text-lg font-semibold text-[#1dacbc] hover:underline underline-offset-4 decoration-2'>T&C</a>
                </div>

                <div className='flex space-x-4 items-center'>
                    {!loading && isLoggedIn ? (
                        <>
                            {/* Reservation Button */}
                            <a href="/reservation">
                                <button className="bg-[#1dacbc] flex items-center gap-1 text-white py-4 px-4 rounded-full font-semibold hover:bg-[#14939e] transition">
                                    <FaCalendarDays /> Reservation
                                </button>
                            </a>

                            {/* Profile Avatar */}
                            <div className="relative" ref={menuRef}>
                                {/* Profile Avatar Button */}
                                <button
                                    onClick={() => setIsMenuOpen((prev) => !prev)}
                                    aria-haspopup="menu"
                                    aria-expanded={isMenuOpen}
                                    className="w-16 h-16 rounded-full bg-[#1dacbc] text-white font-semibold flex items-center justify-center hover:bg-[#14939e] transition overflow-hidden border-2 border-[#1dacbc]"
                                >
                                    {userData?.profileImage ? (
                                        <img
                                            src={userData.profileImage}
                                            alt={userData.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-lg">
                                            {getInitials(userData?.name || 'U')}
                                        </span>
                                    )}
                                </button>

                                {isMenuOpen && (
                                    <div
                                        role="menu"
                                        className="absolute right-0 mt-3 w-56 bg-white border border-[#e6f4f6] rounded-xl shadow-[0_10px_30px_rgba(13,148,136,0.18)] overflow-hidden z-50"
                                    >
                                        <div className="px-4 py-3 bg-[#f2fbfb] border-b border-[#e6f4f6]">
                                            <p className="text-base font-semibold text-[#0f766e] truncate">
                                                {userData?.name || 'User'}
                                            </p>
                                            <p className="text-sm text-gray-600 truncate">
                                                {userData?.email || ''}
                                            </p>
                                        </div>

                                        <div className="py-2">
                                            <a
                                                href="/profile"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#f2fbfb]"
                                            >
                                                Profile
                                            </a>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-[#ef4444] hover:bg-[#fff1f2]"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <a href="/signin">
                            <button className="bg-[#1dacbc] flex items-center gap-1 text-white py-4 px-4 rounded-full font-semibold hover:bg-[#14939e] transition">
                                <FaCalendarDays /> Reservasion
                            </button>
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Navbar