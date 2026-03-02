"use client";

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { FaCalendarDays } from "react-icons/fa6";
import { Menu, X } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
    id: string;
    name: string;
    email: string;
    profileImage?: string | null;
    image?: string | null;
}

const Navbar = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const isLoggedIn = status === "authenticated";
    const loading = status === "loading";
    const userData: UserData | null = session?.user ? {
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        profileImage: session.user.profileImage || session.user.image || null,
        image: session.user.image || session.user.profileImage || null,
    } : null;

    const navItems = [
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/about-us' },
        { label: 'Outlet', href: '/outlets' },
        { label: 'Check Status', href: '/check-status' },
        { label: 'T&C', href: '/terms-and-conditions' },
    ];

    const navItemsWithAuth = isLoggedIn
        ? [...navItems, { label: 'My Profile', href: '/profile' }]
        : navItems;

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

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            if (window.innerWidth >= 1280) {
                setIsMobileNavOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        document.body.style.overflow = isMobileNavOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileNavOpen]);

    const handleLogout = async () => {
        setIsMobileNavOpen(false);
        await signOut({ callbackUrl: '/signin' });
    };

    const handleReservationClickWhenUnauthorized = () => {
        setIsMobileNavOpen(false);
        toast.info('Please sign in first to access reservation.');
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
        <header className='relative border-b border-gray-100 bg-white'>
            <div className='container mx-auto px-3 sm:px-4 py-3 sm:py-4'>
                <div className='flex justify-between items-center gap-3'>

                {/* Logo */}
                <Link href="/" className='shrink-0'>
                    <h1 className='text-[1.7rem] sm:text-3xl md:text-4xl font-bold text-[#1dacbc] tracking-tight'>
                        LAUNDRYQ
                    </h1>
                </Link>

                <nav className='hidden xl:flex items-center gap-4 2xl:gap-6'>
                    {navItemsWithAuth.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className='text-[15px] 2xl:text-base font-semibold text-[#1dacbc] hover:underline underline-offset-4 decoration-2 whitespace-nowrap'
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className='hidden xl:flex space-x-3 items-center shrink-0'>
                    {!loading && isLoggedIn ? (
                        <>
                            <Link href="/reservation">
                                <button className="bg-[#1dacbc] flex items-center gap-1.5 text-white py-3 px-4 rounded-full font-semibold hover:bg-[#14939e] transition">
                                    <FaCalendarDays /> Reservation
                                </button>
                            </Link>

                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsMenuOpen((prev) => !prev)}
                                    aria-haspopup="menu"
                                    aria-expanded={isMenuOpen}
                                    className="w-12 h-12 rounded-full bg-[#1dacbc] text-white font-semibold flex items-center justify-center hover:bg-[#14939e] transition overflow-hidden border-2 border-[#1dacbc]"
                                >
                                    {userData?.profileImage ? (
                                        <img
                                            src={userData.profileImage}
                                            alt={userData.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm">
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
                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#f2fbfb]"
                                            >
                                                Profile
                                            </Link>
                                            <Link
                                                href="/check-status"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#f2fbfb]"
                                            >
                                                Check Status
                                            </Link>
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
                        <button
                            type="button"
                            onClick={handleReservationClickWhenUnauthorized}
                            className="bg-[#1dacbc] flex items-center gap-1.5 text-white py-3 px-4 rounded-full font-semibold hover:bg-[#14939e] transition"
                        >
                                <FaCalendarDays /> Reservation
                        </button>
                    )}
                </div>

                <div className='flex xl:hidden items-center gap-2'>
                    {isLoggedIn && !loading && (
                        <Link href="/profile" className="w-10 h-10 rounded-full bg-[#1dacbc] text-white font-semibold flex items-center justify-center overflow-hidden border border-[#1dacbc]">
                            {userData?.profileImage ? (
                                <img
                                    src={userData.profileImage}
                                    alt={userData.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xs">{getInitials(userData?.name || 'U')}</span>
                            )}
                        </Link>
                    )}

                    <button
                        onClick={() => setIsMobileNavOpen((prev) => !prev)}
                        aria-label="Toggle menu"
                        className="w-10 h-10 rounded-lg border border-[#e6f4f6] text-[#1dacbc] flex items-center justify-center"
                    >
                        {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {isMobileNavOpen && (
                <div className="xl:hidden absolute left-0 right-0 top-full z-50 border-t border-gray-100 bg-white shadow-lg max-h-[calc(100vh-72px)] overflow-y-auto">
                    <div className="px-3 sm:px-4 pt-3 space-y-1">
                        {navItemsWithAuth.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileNavOpen(false)}
                                className="block rounded-lg px-3 py-2.5 text-[#1dacbc] font-semibold hover:bg-[#f2fbfb]"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="px-3 sm:px-4 pt-3 pb-4 space-y-2">
                        {!loading && isLoggedIn ? (
                            <>
                                <Link
                                    href="/reservation"
                                    onClick={() => setIsMobileNavOpen(false)}
                                    className="w-full bg-[#1dacbc] text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 hover:bg-[#14939e] transition"
                                >
                                    <FaCalendarDays /> Reservation
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-2.5 rounded-lg font-semibold border border-[#fecdd3] text-[#ef4444] hover:bg-[#fff1f2]"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleReservationClickWhenUnauthorized}
                                    className="w-full bg-[#1dacbc] text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 hover:bg-[#14939e] transition"
                                >
                                    <FaCalendarDays /> Reservation
                                </button>
                                <Link
                                    href="/signin"
                                    onClick={() => setIsMobileNavOpen(false)}
                                    className="w-full bg-[#1dacbc] text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 hover:bg-[#14939e] transition"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    onClick={() => setIsMobileNavOpen(false)}
                                    className="w-full bg-[#1dacbc] text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 hover:bg-[#14939e] transition"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
            </div>
        </header>
    )
}

export default Navbar