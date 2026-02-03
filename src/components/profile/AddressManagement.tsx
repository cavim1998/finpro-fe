'use client';

import React, { useEffect, useState } from 'react';
import AddressList from './AddressList';
import AddressForm from './AddressForm';
import { Address } from '@/types/address';
import { addressService } from '@/services/addressService';
import { MapPin, Plus, Loader2 } from 'lucide-react';

export default function AddressManagement() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [error, setError] = useState('');

  // Load addresses
  useEffect(() => {
    const loadAddresses = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await addressService.getAll();
        setAddresses(data);
      } catch (error: any) {
        const message =
          error.response?.data?.message || 'Gagal memuat alamat. Silakan refresh halaman.';
        setError(message);
        console.error('Failed to load addresses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, []);

  const handleOpenForm = (address?: Address) => {
    if (address) {
      setSelectedAddress(address);
    } else {
      setSelectedAddress(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedAddress(null);
  };

  const handleAddressSaved = (savedAddress: Address) => {
    setAddresses((prevAddresses) => {
      const index = prevAddresses.findIndex((a) => a.id === savedAddress.id);
      if (index >= 0) {
        // Update existing
        const updated = [...prevAddresses];
        updated[index] = savedAddress;
        return updated;
      } else {
        // Add new
        return [...prevAddresses, savedAddress];
      }
    });
  };

  const handleAddressDeleted = (id: number) => {
    setAddresses((prevAddresses) => prevAddresses.filter((a) => a.id !== id));
  };

  const handleAddressPrimary = (id: number) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((a) => ({
        ...a,
        isPrimary: a.id === id,
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Alamat Saya</h2>
            <p className="text-gray-500 text-sm">
              Kelola alamat pengiriman Anda
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenForm()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Tambah Alamat
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Memuat alamat Anda...</p>
        </div>
      )}

      {/* Address List */}
      {!loading && (
        <AddressList
          addresses={addresses}
          onAddressDeleted={handleAddressDeleted}
          onAddressPrimary={handleAddressPrimary}
          onEditAddress={handleOpenForm}
          isLoading={loading}
        />
      )}

      {/* Add/Edit Form Modal */}
      <AddressForm
        address={selectedAddress}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onAddressSaved={handleAddressSaved}
      />
    </div>
  );
}
