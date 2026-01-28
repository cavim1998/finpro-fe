'use client';

import React from 'react';
import { ShoppingBag, Truck } from 'lucide-react';
import StatsSection from './StatsSection';
import { Order, PickupRequest } from '@/types/admin';

interface DashboardViewProps {
  userRole: string;
  onNavigate: (tab: any) => void;
  onProcessPickup: () => void;
}

export const mockPickupRequests: PickupRequest[] = [
  {
    id: 'PCK-001',
    customer: 'Budi Santoso',
    address: 'Jl. Mawar No. 10',
    time: '10:00 AM',
    status: 'DRIVER_ARRIVED'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-2026-001',
    customer: 'Siti Aminah',
    weight: 3.5,
    itemsCount: 7,
    status: 'SEDANG_DICUCI',
    date: '2026-01-27'
  },
  {
    id: 'ORD-2026-002',
    customer: 'Rudi Hartono',
    weight: 5.0,
    itemsCount: 12,
    status: 'LAUNDRY_DI_OUTLET',
    date: '2026-01-27'
  },
]; 

export const DashboardView = ({ userRole, onNavigate, onProcessPickup }: DashboardViewProps) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Hello, {userRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Outlet Admin'}! 👋</h1>
        <p className="text-gray-500">Berikut adalah ringkasan operasional outlet hari ini.</p>
      </div>

      <StatsSection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget Pickup */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Truck size={18} className="text-[#17A2B8]" /> Pickup Request Baru
            </h3>
            <button onClick={() => onNavigate('PICKUP')} className="text-sm text-[#17A2B8] hover:underline">Lihat Semua</button>
          </div>
          <div className="space-y-3">
            {mockPickupRequests.slice(0, 2).map(req => (
               <div key={req.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">{req.customer}</p>
                    <p className="text-xs text-gray-500">{req.time}</p>
                  </div>
                  <button onClick={onProcessPickup} className="text-xs bg-white border border-blue-200 px-3 py-1 rounded text-blue-600 font-bold">Proses</button>
               </div>
            ))}
          </div>
        </div>

        {/* Widget Orders */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBag size={18} className="text-orange-500" /> Sedang Dicuci
            </h3>
            <button onClick={() => onNavigate('ORDERS')} className="text-sm text-gray-500 hover:text-gray-800">Lihat Semua</button>
          </div>
          <div className="space-y-3">
            {mockOrders.slice(0, 2).map(order => (
               <div key={order.id} className="p-3 border border-gray-100 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{order.customer}</p>
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{order.status}</span>
                  </div>
                  <span className="text-xs text-gray-400">{order.itemsCount} Items</span>
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};