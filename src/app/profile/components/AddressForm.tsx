'use client';

import React, { useEffect, useState, lazy, Suspense } from 'react';
import { toast } from 'sonner';
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
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (address) {
      // Edit mode - load existing address
      setFormData({
        label: address.label || '',
        addressText: address.addressText,
        latitude: typeof address.latitude === 'number' ? address.latitude : parseFloat(String(address.latitude)) || DEFAULT_LAT,
        longitude: typeof address.longitude === 'number' ? address.longitude : parseFloat(String(address.longitude)) || DEFAULT_LNG,
        receiverName: address.receiverName || '',
        receiverPhone: address.receiverPhone || '',
        isPrimary: address.isPrimary,
      });
      setErrors({});
    } else {
      // Add mode - reset form and get GPS
      setFormData({
        label: '',
        addressText: '',
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LNG,
        receiverName: '',
        receiverPhone: '',
        isPrimary: false,
      });
      setErrors({});

      // Get GPS location
      if ('geolocation' in navigator) {
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setFormData(prev => ({
              ...prev,
              latitude,
              longitude,
            }));
            setGettingLocation(false);
          },
          (error) => {
            console.warn('GPS error:', error.message);
            setGettingLocation(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      }
    }
  }, [isOpen, address]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.addressText.trim()) {
      newErrors.addressText = 'Address cannot be empty';
    } else if (formData.addressText.trim().length < 10) {
      newErrors.addressText = 'Address must be at least 10 characters';
    }

    if (formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
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
        (address ? 'Failed to update address' : 'Failed to add address');
      toast.error(message);
      setErrors({});
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-lg rounded-t-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {address ? 'Edit Address' : 'Add New Address'}
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
          {/* Map Picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <MapPin className="w-4 h-4 inline mr-2" />
              Select Location on Map
            </label>
            {gettingLocation && (
              <div className="h-[350px] bg-blue-50 border border-blue-200 rounded-lg flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#1dacbc]" />
                <p className="text-sm text-gray-600">Getting your GPS location...</p>
              </div>
            )}
            {!gettingLocation && showMap && (
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
              💡 Click on the map to change location
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

          {/* Address Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Address <span className="text-red-500">*</span>
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
              placeholder="Your full address here..."
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
              Address Label (e.g.: Home, Office, Boarding House)
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
              placeholder="Home"
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
              Recipient Name
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
              placeholder="Receipient full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Receiver Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Recipient Phone Number
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
              placeholder="Your phone number"
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
              Set as primary address
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {address ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
