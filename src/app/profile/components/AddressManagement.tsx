'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
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

  // Load addresses
  useEffect(() => {
    const loadAddresses = async () => {
      setLoading(true);
      try {
        const data = await addressService.getAll();
        setAddresses(data);
      } catch (error: any) {
        const message =
          error.response?.data?.message || 'Failed to load addresses. Please refresh the page.';
        toast.error(message);
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
        toast.success('Address updated successfully');
        return updated;
      } else {
        // Add new
        toast.success('Address added successfully');
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
            <MapPin className="w-6 h-6 text-[#1dacbc]" />
          </div>
          <div className='flex flex-col'>
            <h2 className="text-2xl font-bold text-[#1dacbc]">My Addresses</h2>
            <p className="text-gray-500 text-sm">
              Manage your delivery addresses
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenForm()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1dacbc] text-white rounded-lg font-medium hover:bg-[#14939e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Add Address
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Loading your addresses...</p>
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
