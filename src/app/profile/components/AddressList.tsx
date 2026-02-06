'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Address } from '@/types/address';
import { addressService } from '@/services/addressService';
import { MapPin, Edit2, Trash2, Star } from 'lucide-react';

interface AddressListProps {
  addresses: Address[];
  onAddressDeleted: (id: number) => void;
  onAddressPrimary: (id: number) => void;
  onEditAddress: (address: Address) => void;
  isLoading?: boolean;
}

export default function AddressList({
  addresses,
  onAddressDeleted,
  onAddressPrimary,
  onEditAddress,
  isLoading = false,
}: AddressListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    setDeletingId(id);
    try {
      await addressService.delete(id);
      toast.success('Address deleted successfully');
      onAddressDeleted(id);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Failed to delete address. Please try again.';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (id: number) => {
    setSettingPrimaryId(id);
    try {
      await addressService.setPrimary(id);
      toast.success('Set as primary address successfully');
      onAddressPrimary(id);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Failed to set primary address. Please try again.';
      toast.error(message);
    } finally {
      setSettingPrimaryId(null);
    }
  };

  if (addresses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <MapPin className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-center mb-4">
          No saved addresses yet. Add your first address.
        </p>
      </div>
    );
  }

  // Sort addresses: primary first, then by creation date
  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-4">
      {sortedAddresses.map((address) => (
        <div
          key={address.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
        >
          {/* Header dengan badge primary */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-gray-800">
                {address.label || 'Alamat'}
              </h3>
              {address.isPrimary && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                  <Star className="w-3 h-3" />
                  Primary
                </span>
              )}
            </div>
          </div>

          {/* Alamat text */}
          <p className="text-gray-700 mb-3 leading-relaxed text-sm">
            {address.addressText}
          </p>

          {/* Info Penerima */}
          {(address.receiverName || address.receiverPhone) && (
            <div className="bg-gray-50 rounded p-3 mb-3 text-sm space-y-1">
              {address.receiverName && (
                <p className="text-gray-700">
                  <span className="font-semibold">Recipient Name:</span>{' '}
                  {address.receiverName}
                </p>
              )}
              {address.receiverPhone && (
                <p className="text-gray-700">
                  <span className="font-semibold">Phone Number:</span>{' '}
                  {address.receiverPhone}
                </p>
              )}
            </div>
          )}

          {/* Koordinat */}
          <div className="text-xs text-gray-500 mb-4">
            📍 Lat: {typeof address.latitude === 'number' ? address.latitude.toFixed(5) : parseFloat(String(address.latitude)).toFixed(5)}, Lng:{' '}
            {typeof address.longitude === 'number' ? address.longitude.toFixed(5) : parseFloat(String(address.longitude)).toFixed(5)}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onEditAddress(address)}
              disabled={isLoading || deletingId === address.id}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>

            {!address.isPrimary && (
              <button
                onClick={() => handleSetPrimary(address.id)}
                disabled={settingPrimaryId === address.id || isLoading}
                className="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-600 rounded hover:bg-amber-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Star className="w-4 h-4" />
                Set as Primary
              </button>
            )}

            <button
              onClick={() => handleDelete(address.id)}
              disabled={deletingId === address.id || isLoading}
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              {deletingId === address.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
