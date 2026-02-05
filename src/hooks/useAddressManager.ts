'use client';

import { useState, useEffect, useCallback } from 'react';
import { Address } from '@/types/address';
import { addressService } from '@/services/addressService';

export interface UseAddressManagerResult {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  primaryAddress: Address | null;
  loadAddresses: () => Promise<void>;
  addAddress: (address: Address) => void;
  removeAddress: (id: number) => void;
  updateAddress: (id: number, address: Address) => void;
  setPrimary: (id: number) => void;
}

/**
 * Custom hook untuk manage addresses
 * Bisa digunakan di component manapun yang butuh address data
 */
export function useAddressManager(): UseAddressManagerResult {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load addresses dari API
  const loadAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await addressService.getAll();
      setAddresses(data);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Gagal memuat alamat. Silakan refresh halaman.';
      setError(message);
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Get primary address
  const primaryAddress =
    addresses.find((addr) => addr.isPrimary) || null;

  // Add address ke state (after create)
  const addAddress = useCallback((address: Address) => {
    setAddresses((prev) => [...prev, address]);
  }, []);

  // Remove address dari state (after delete)
  const removeAddress = useCallback((id: number) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  }, []);

  // Update address di state (after edit)
  const updateAddress = useCallback((id: number, updated: Address) => {
    setAddresses((prev) =>
      prev.map((addr) => (addr.id === id ? updated : addr))
    );
  }, []);

  // Set primary di state
  const setPrimary = useCallback((id: number) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isPrimary: addr.id === id,
      }))
    );
  }, []);

  return {
    addresses,
    loading,
    error,
    primaryAddress,
    loadAddresses,
    addAddress,
    removeAddress,
    updateAddress,
    setPrimary,
  };
}

/**
 * Usage example:
 *
 * import { useAddressManager } from '@/hooks/useAddressManager';
 *
 * export function MyComponent() {
 *   const { addresses, loading, error, primaryAddress } = useAddressManager();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <div>
 *       <h2>Primary: {primaryAddress?.label}</h2>
 *       <ul>
 *         {addresses.map((addr) => (
 *           <li key={addr.id}>{addr.label}: {addr.addressText}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 */
