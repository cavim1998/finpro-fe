'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EditPersonalDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    currentPhone: string;
    onSave: (name: string, phone: string) => Promise<void>;
}

export default function EditPersonalDataModal({
    isOpen,
    onClose,
    currentName,
    currentPhone,
    onSave,
}: EditPersonalDataModalProps) {
    const [name, setName] = useState(currentName);
    const [phone, setPhone] = useState(currentPhone);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(currentName);
            setPhone(currentPhone);
            setError('');
        }
    }, [isOpen, currentName, currentPhone]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        setLoading(true);
        try {
            await onSave(name, phone);
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Personal Data</h2>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1dacbc]"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    {/* Phone Input */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1dacbc]"
                            placeholder="08123456789"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#1dacbc] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#14939e] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
