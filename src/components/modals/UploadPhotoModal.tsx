'use client';

import React, { useState } from 'react';
import { FaTimes, FaCloudUploadAlt } from 'react-icons/fa';

interface UploadPhotoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (file: File) => void;
}

const UploadPhotoModal: React.FC<UploadPhotoModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setError('Only JPG, PNG, and GIF files are allowed');
            return;
        }

        // Validate file size (1MB)
        if (file.size > 1024 * 1024) {
            setError('File size must not exceed 1MB');
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;

        setLoading(true);
        
        // Simulasi API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setLoading(false);
        onSubmit(selectedFile);
        handleClose();
    };

    const handleClose = () => {
        setPreview(null);
        setSelectedFile(null);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Upload Profile Photo</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Preview */}
                    {preview ? (
                        <div className="flex justify-center mb-4">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-48 h-48 object-cover rounded-lg"
                            />
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-2" />
                            <p className="text-gray-600 font-semibold">Drag or click to upload</p>
                            <p className="text-xs text-gray-500">JPG, PNG, GIF up to 1MB</p>
                        </div>
                    )}

                    {/* File Input */}
                    <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={handleFileSelect}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer"
                    />

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-700 text-xs">
                            <strong>Requirements:</strong> 1MB max, JPG/PNG/GIF only
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={handleClose}
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedFile || loading}
                        className="flex-1 bg-[#1dacbc] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#14939e] transition disabled:opacity-50"
                    >
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadPhotoModal;
