'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/admin/Navbar';
import CreateOrderModal from '@/components/admin/modal/CreateOrderModal';
import BypassModal from '@/components/admin/modal/BypassModal';

// Views Components (Yang baru dibuat)
import { DashboardView } from '@/components/admin/DashboardView';
import { OrderListView } from '@/components/admin/OrderListView';
import ReportSection from '@/components/admin/ReportSection';
import MasterDataSection from '@/components/admin/MasterDataSection';
import { Order, PickupRequest, TabType, UserRole } from '@/types/admin';

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

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBypassModal, setShowBypassModal] = useState(false);
  const [page, setPage] = useState(1);
  
  const userRole: UserRole = 'SUPER_ADMIN'; 
  const TAKE = 5;

  useEffect(() => setPage(1), [activeTab]);

  const currentDataList = activeTab === 'ORDERS' ? mockOrders : mockPickupRequests;
  const startIndex = (page - 1) * TAKE;
  const endIndex = startIndex + TAKE;
  const paginatedData = currentDataList.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-16 font-sans">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenBypass={() => setShowBypassModal(true)} 
        userRole={userRole}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'DASHBOARD' && (
          <DashboardView 
            userRole={userRole}
            onNavigate={setActiveTab}
            onProcessPickup={() => setShowCreateModal(true)}
          />
        )}

        {(activeTab === 'ORDERS' || activeTab === 'PICKUP') && (
          <OrderListView 
            title={activeTab === 'ORDERS' ? 'Order Management' : 'Pickup Requests'}
            isPickupTab={activeTab === 'PICKUP'}
            data={paginatedData}
            page={page}
            totalData={currentDataList.length}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setPage}
            onCreateOrder={() => setShowCreateModal(true)}
          />
        )}

        {activeTab === 'REPORT' && <ReportSection />}
        
        {activeTab === 'MASTER' && userRole === 'SUPER_ADMIN' && <MasterDataSection />}
      </main>

      <CreateOrderModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <BypassModal isOpen={showBypassModal} onClose={() => setShowBypassModal(false)} />
    </div>
  );
}