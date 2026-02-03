'use client';

import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Address, CreateAddressPayload } from '@/types/address';
import { addressService } from '@/services/addressService';
import { X, MapPin, Loader2 } from 'lucide-react';

// Dynamic import MapPicker to avoid SSR issues
const MapPicker = lazy(() => import('./MapPicker'));

interface AddressFormProps {
  address?: Address | null;
  isOpen: boolean;
  onClose: () => void;
  onAddressSaved: (address: Address) => void;
}

const DEFAULT_LAT = -6.2088; // Jakarta
const DEFAULT_LNG = 106.8456;

export default function AddressForm({
  address,
  isOpen,
  onClose,
  onAddressSaved,
}: AddressFormProps) {
  const [formData, setFormData] = useState<CreateAddressPayload>({
    label: '',
    addressText: '',
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LNG,
    receiverName: '',
    receiverPhone: '',
    isPrimary: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label || '',
        addressText: address.addressText,
        latitude: typeof address.latitude === 'number' ? address.latitude : parseFloat(String(address.latitude)) || DEFAULT_LAT,
        longitude: typeof address.longitude === 'number' ? address.longitude : parseFloat(String(address.longitude)) || DEFAULT_LNG,
        receiverName: address.receiverName || '',
        receiverPhone: address.receiverPhone || '',
        isPrimary: address.isPrimary,
      });
    } else {
      setFormData({
        label: '',
        addressText: '',
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LNG,
        receiverName: '',
        receiverPhone: '',
        isPrimary: false,
      });
    }
    setErrors({});
  }, [address, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.addressText.trim()) {
      newErrors.addressText = 'Alamat tidak boleh kosong';
    } else if (formData.addressText.trim().length < 10) {
      newErrors.addressText = 'Alamat minimal 10 karakter';
    }

    if (formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = 'Latitude harus antara -90 hingga 90';
    }

    if (formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = 'Longitude harus antara -180 hingga 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      let savedAddress: Address;

      if (address) {
        // Update existing
        savedAddress = await addressService.update(address.id, formData);
      } else {
        // Create new
        savedAddress = await addressService.create(formData);
      }

      onAddressSaved(savedAddress);
      onClose();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        (address ? 'Gagal memperbarui alamat' : 'Gagal menambah alamat');
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-lg rounded-t-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {address ? 'Edit Alamat' : 'Tambah Alamat Baru'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Map Picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <MapPin className="w-4 h-4 inline mr-2" />
              Pilih Lokasi di Map
            </label>
            {showMap && (
              <Suspense fallback={<div className="h-[350px] bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>}>
                <MapPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationChange={(lat, lng) => {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                    }));
                  }}
                  height="350px"
                />
              </Suspense>
            )}
            <p className="text-xs text-gray-500 mt-2">
              💡 Klik pada peta untuk mengubah lokasi
            </p>
          </div>

          {/* Koordinat Display */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
              />
            </div>
          </div>

          {/* Alamat Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alamat Lengkap <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.addressText}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  addressText: e.target.value,
                }));
                if (errors.addressText) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.addressText;
                    return newErrors;
                  });
                }
              }}
              placeholder="Jl. Merdeka No. 123, Jakarta Pusat, DKI Jakarta"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {errors.addressText && (
              <p className="text-red-500 text-xs mt-1">{errors.addressText}</p>
            )}
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Label Alamat (contoh: Rumah, Kantor, Kos)
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => {
                const value = e.target.value.slice(0, 50);
                setFormData((prev) => ({
                  ...prev,
                  label: value,
                }));
              }}
              placeholder="Rumah"
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-gray-500 text-xs mt-1">
              {(formData.label || '').length}/50
            </p>
          </div>

          {/* Receiver Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Penerima
            </label>
            <input
              type="text"
              value={formData.receiverName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  receiverName: e.target.value,
                }))
              }
              placeholder="Nama lengkap penerima paket"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Receiver Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nomor HP Penerima
            </label>
            <input
              type="tel"
              value={formData.receiverPhone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  receiverPhone: e.target.value,
                }))
              }
              placeholder="08123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Jadikan Primary */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrimary"
              checked={formData.isPrimary}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isPrimary: e.target.checked,
                }))
              }
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="isPrimary" className="ml-3 text-sm text-gray-700">
              Jadikan sebagai alamat utama
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {address ? 'Update Alamat' : 'Simpan Alamat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
