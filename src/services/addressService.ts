'use client';

import { axiosInstance } from '@/lib/axios';
import { Address, CreateAddressPayload, UpdateAddressPayload, AddressResponse } from '@/types/address';

class AddressService {
  /**
   * Get all addresses untuk user yang login
   */
  async getAll(): Promise<Address[]> {
    try {
      const response = await axiosInstance.get<AddressResponse>('/users/addresses');
      const data = response.data.data;
      
      // Handle both single address and array
      if (Array.isArray(data)) {
        return data;
      }
      
      // If single address, return as array
      if (data) {
        return [data as Address];
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      throw error;
    }
  }

  /**
   * Create alamat baru
   */
  async create(payload: CreateAddressPayload): Promise<Address> {
    try {
      const response = await axiosInstance.post<AddressResponse>('/users/addresses', payload);
      return response.data.data as Address;
    } catch (error) {
      console.error('Failed to create address:', error);
      throw error;
    }
  }

  /**
   * Update alamat yang sudah ada
   */
  async update(id: number, payload: UpdateAddressPayload): Promise<Address> {
    try {
      const response = await axiosInstance.put<AddressResponse>(`/users/addresses/${id}`, payload);
      return response.data.data as Address;
    } catch (error) {
      console.error('Failed to update address:', error);
      throw error;
    }
  }

  /**
   * Hapus alamat
   */
  async delete(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/users/addresses/${id}`);
    } catch (error) {
      console.error('Failed to delete address:', error);
      throw error;
    }
  }

  /**
   * Set alamat sebagai primary
   */
  async setPrimary(id: number): Promise<Address> {
    try {
      const response = await axiosInstance.put(`/users/addresses/${id}/primary`);
      // BE response format: { success: true, data: addressObject }
      return response.data.data as Address;
    } catch (error) {
      console.error('Failed to set primary address:', error);
      throw error;
    }
  }
}

export const addressService = new AddressService();
