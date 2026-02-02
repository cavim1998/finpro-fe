'use client';

import React, { useState } from 'react';
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (currentPassword: string, newPassword: string) => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!currentPassword) {
            setError('Please enter your current password');
            return;
        }

        if (!newPassword) {
            setError('Please enter a new password');
            return;
        }

        if (newPassword.length < 8) {
            setError('New password must be at least 8 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (currentPassword === newPassword) {
            setError('New password must be different from current password');
            return;
        }

        setLoading(true);
        
        // Simulasi API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setLoading(false);
        onSubmit(currentPassword, newPassword);
        handleClose();
    };

    const handleClose = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Current Password */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Current Password</label>
                        <div className="relative">
                            <input 
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1dacbc] pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-2.5 text-gray-500"
                            >
                                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">New Password</label>
                        <div className="relative">
                            <input 
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1dacbc] pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-2.5 text-gray-500"
                            >
                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Confirm New Password</label>
                        <div className="relative">
                            <input 
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-700 text-xs">
                            <strong>Tip:</strong> Use a mix of uppercase, lowercase, numbers, and symbols for a strong password.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#1dacbc] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#14939e] transition disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
