'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Cookies from 'js-cookie';
import UploadPhotoModal from '@/components/modals/UploadPhotoModal';
import ChangeEmailModal from '@/components/modals/ChangeEmailModal';
import ChangePasswordModal from '@/components/modals/ChangePasswordModal';
import EditPersonalDataModal from '@/components/modals/EditPersonalDataModal';
import AddressManagement from '@/app/profile/components/AddressManagement';
import { axiosInstance } from '@/lib/axios';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    profileImage?: string | null;
    verified: boolean;
    createdAt?: string;
    updatedAt?: string;
    provider?: string; // 'google' or 'email'
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isEditPersonalDataOpen, setIsEditPersonalDataOpen] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/users/profile');
                const user = response?.data?.data?.user || response?.data?.data;
                if (user) {
                    setProfile(user);
                    setName(user.name || '');
                    setPhone(user.phone || '');
                    setAddress(user.address || '');
                }
            } catch (err: any) {
                const message = err?.response?.data?.message || 'Failed to load profile.';
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleSaveProfile = async (newName: string, newPhone: string) => {
        setSaving(true);
        try {
            const response = await axiosInstance.put('/users/profile', {
                name: newName,
                phone: newPhone || null,
            });
            const user = response?.data?.data?.user || response?.data?.data;
            if (user) {
                setProfile(user);
                setName(user.name || '');
                setPhone(user.phone || '');
                // Update cookie so navbar reflects new name
                const isProduction = window.location.protocol === 'https:';
                Cookies.set('user_data', JSON.stringify(user), { 
                    expires: 7, 
                    secure: isProduction, 
                    sameSite: 'strict' 
                });
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('user-data-updated'));
                }
                toast.success('Profile updated successfully');
            }
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to update profile.';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleUploadPhoto = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await axiosInstance.post('/users/profile/photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const photoUrl = response?.data?.data?.url;
            // Update only profileImage, preserve all other fields
            if (photoUrl && profile) {
                const updatedProfile = { ...profile, profileImage: photoUrl };
                setProfile(updatedProfile);
                
                // Update cookie so navbar reflects new photo
                const isProduction = window.location.protocol === 'https:';
                Cookies.set('user_data', JSON.stringify(updatedProfile), { 
                    expires: 7, 
                    secure: isProduction, 
                    sameSite: 'strict' 
                });
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('user-data-updated'));
                }
                toast.success('Profile photo updated successfully');
            }
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to upload profile photo.';
            toast.error(message);
        }
    };

    const handleChangeEmail = async (newEmail: string, password: string) => {
        try {
            await axiosInstance.put('/users/profile/email', {
                newEmail,
                password,
            });
            toast.success('Verification code sent to your new email. Please verify to complete the change.');
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to change email.';
            toast.error(message);
        }
    };

    const handleChangePassword = async (currentPassword: string, newPassword: string) => {
        try {
            await axiosInstance.put('/users/profile/password', {
                currentPassword,
                newPassword,
            });
            toast.success('Password changed successfully');
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to change password.';
            toast.error(message);
        }
    };
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            
            {/* Main Content */}
            <div className="grow">
                {/* Hero Section */}
                <div className="bg-linear-to-r from-[#1dacbc] to-[#14939e] text-white py-8">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold">My Profile</h1>
                        <p className="text-[#e8faf7] text-lg mt-2">Manage your personal information</p>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="container mx-auto px-4 py-12">
                    {loading && (
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <p className="text-gray-600">Loading profile...</p>
                        </div>
                    )}

                    {!loading && profile && !profile.verified && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded">
                            <div className="flex">
                                <div className="shrink-0">
                                    <span className="text-yellow-400">⚠</span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        Your email is not yet verified. <a href="/resend-verification" className="font-semibold underline">Resend verification email</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* Sidebar - Profile Image & Quick Actions */}
                        <div className="md:col-span-1 space-y-4">
                            {/* Profile Card */}
                            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                {/* Profile Image Placeholder */}
                                <div className="w-40 h-40 mx-auto bg-gray-300 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                                    {profile?.profileImage ? (
                                        <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-500">Image</span>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{profile?.name || 'User Name'}</h2>
                                <p className="text-gray-500 mb-4">LaundryQ Member</p>
                                <button
                                    className="w-full bg-[#1dacbc] text-white py-2 px-4 rounded-lg hover:bg-[#14939e] transition mb-2"
                                    onClick={() => setIsUploadOpen(true)}
                                >
                                    Edit Photo
                                </button>
                                <p className="text-xs text-gray-500 mt-2">Max 1MB • JPG, PNG, GIF</p>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h4 className="font-semibold text-gray-800 mb-3">Account</h4>
                                <ul className="space-y-2">
                                    <li><a href="#personal" className="text-[#1dacbc] hover:underline text-sm">Personal Data</a></li>
                                    <li><a href="#addresses" className="text-[#1dacbc] hover:underline text-sm">My Addresses</a></li>
                                </ul>
                            </div>
                        </div>

                        {/* Main Content - Profile Details */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Personal Data Section */}
                            <div id="personal" className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-[#1dacbc] flex items-center">
                                        Personal Data
                                    </h3>
                                    <button
                                        onClick={() => setIsEditPersonalDataOpen(true)}
                                        className="bg-[#1dacbc] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#14939e] transition text-sm"
                                    >
                                        Edit
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-gray-600 text-sm font-semibold mb-1">Full Name</label>
                                        <p className="text-gray-800 text-lg">{profile?.name || '—'}</p>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-gray-600 text-sm font-semibold mb-1">Phone Number</label>
                                        <p className="text-gray-800 text-lg">{profile?.phone || '—'}</p>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t border-gray-200"></div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-gray-600 text-sm font-semibold mb-1">Email Address</label>
                                        <div className="flex gap-2 items-center">
                                            <p className="text-gray-800 text-lg flex-1">{profile?.email || '—'}</p>
                                            <button
                                                className="px-4 py-2 border border-[#1dacbc] text-[#1dacbc] rounded-lg font-semibold hover:bg-gray-50 transition text-sm whitespace-nowrap"
                                                onClick={() => setIsChangeEmailOpen(true)}
                                            >
                                                Change Email
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Status:{' '}
                                            {profile?.verified ? (
                                                <span className="text-green-600 font-semibold">Verified</span>
                                            ) : (
                                                <span className="text-yellow-600 font-semibold">Unverified</span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Password - Hanya tampil jika bukan Google user */}
                                    {profile?.provider !== 'google' && (
                                        <div>
                                            <label className="block text-gray-600 text-sm font-semibold mb-1">Password</label>
                                            <div className="flex gap-2 items-center">
                                                <p className="text-gray-800 text-lg flex-1">••••••••</p>
                                                <button
                                                    className="px-4 py-2 bg-[#1dacbc] text-white rounded-lg font-semibold hover:bg-[#14939e] transition text-sm whitespace-nowrap"
                                                    onClick={() => setIsChangePasswordOpen(true)}
                                                >
                                                    Change Password
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Connected Accounts - Hanya tampil jika Google user */}
                                    {profile?.provider === 'google' && (
                                        <div>
                                            <label className="block text-gray-600 text-sm font-semibold mb-2">Connected Accounts</label>
                                            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                                </svg>
                                                <span className="text-gray-700 text-sm">Connected with Google</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Divider */}
                                    <div className="border-t border-gray-200"></div>

                                    {/* Member Since */}
                                    <div>
                                        <label className="block text-gray-600 text-sm font-semibold mb-1">Member Since</label>
                                        <p className="text-gray-800 text-lg">
                                            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            }) : '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Address Management Section */}
                            <div id="addresses" className="bg-white rounded-lg shadow-md p-6">
                                <AddressManagement />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            <UploadPhotoModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onSubmit={handleUploadPhoto}
            />
            <ChangeEmailModal
                isOpen={isChangeEmailOpen}
                onClose={() => setIsChangeEmailOpen(false)}
                currentEmail={profile?.email || ''}
                onSubmit={handleChangeEmail}
            />
            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
                onSubmit={handleChangePassword}
            />
            <EditPersonalDataModal
                isOpen={isEditPersonalDataOpen}
                onClose={() => setIsEditPersonalDataOpen(false)}
                currentName={profile?.name || ''}
                currentPhone={profile?.phone || ''}
                onSave={handleSaveProfile}
            />
        </div>
    );
}
