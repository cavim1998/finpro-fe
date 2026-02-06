'use client';

import { axiosInstance } from '@/lib/axios';

export interface Outlet {
  id: number;
  name: string;
  addressText: string;
  latitude: number;
  longitude: number;
  serviceRadiusKm: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  staffCount?: number;
  staff?: Array<{
    id: number;
    outletId: number;
    userId: string;
    workerStation: string;
    isActive: boolean;
    createdAt: string;
  }>;
}

export interface OutletResponse {
  status: string;
  message: string;
  code: null | string;
  data: Outlet | Outlet[];
}

export interface CreateOutletPayload {
  name: string;
  addressText: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateOutletPayload {
  name?: string;
  addressText?: string;
  latitude?: number;
  longitude?: number;
}

class OutletService {
  private baseUrl = '/outlets';

  /**
   * Get all active outlets
   */
  async getAll(): Promise<Outlet[]> {
    try {
      const response = await axiosInstance.get(this.baseUrl);
      console.log('Raw API response:', response.data);
      
      // Handle different response structures
      let data = response.data;
      
      // If response has a 'data' property, use that
      if (data && typeof data === 'object' && 'data' in data) {
        data = data.data;
      }

      if (Array.isArray(data)) {
        return data;
      }

      if (data) {
        return [data as Outlet];
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch outlets:', error);
      throw error;
    }
  }

  /**
   * Get outlet by ID
   */
  async getById(id: number): Promise<Outlet> {
    try {
      const response = await axiosInstance.get<OutletResponse>(`${this.baseUrl}/${id}`);
      return response.data.data as Outlet;
    } catch (error) {
      console.error('Failed to fetch outlet:', error);
      throw error;
    }
  }

  /**
   * Create new outlet
   */
  async create(payload: CreateOutletPayload): Promise<Outlet> {
    try {
      const response = await axiosInstance.post<OutletResponse>(this.baseUrl, payload);
      return response.data.data as Outlet;
    } catch (error) {
      console.error('Failed to create outlet:', error);
      throw error;
    }
  }

  /**
   * Update outlet
   */
  async update(id: number, payload: UpdateOutletPayload): Promise<Outlet> {
    try {
      const response = await axiosInstance.patch<OutletResponse>(
        `${this.baseUrl}/${id}`,
        payload
      );
      return response.data.data as Outlet;
    } catch (error) {
      console.error('Failed to update outlet:', error);
      throw error;
    }
  }

  /**
   * Delete outlet
   */
  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete outlet:', error);
      throw error;
    }
  }
}

export const outletService = new OutletService();
