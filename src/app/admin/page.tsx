"use client";

import { useState } from "react";
import Navbar from "@/components/admin/Navbar";
import DashboardView from "@/components/admin/DashboardView";
import { OrderListView } from "@/components/admin/OrderListView";
import ReportSection from "@/components/admin/ReportSection";
import MasterDataSection from "@/components/admin/MasterDataSection";
import CreateOrderModal from "@/components/admin/modal/CreateOrderModal";
import BypassListView from "@/components/admin/BypassListView";
import { useAdminAuth } from "./hooks/useAdminAuth";
import { useOrderData } from "./hooks/useOrderData";
import OrderDetailModal from "@/components/admin/modal/OrderDetailModal";
import { useDashboardStats } from "@/components/admin/dashboard/useDashboardStats";

export default function AdminDashboardPage() {
  const { roleCode, userOutletId, isAuthLoading } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<
    "DASHBOARD" | "ORDERS" | "PICKUP" | "BYPASS" | "REPORT" | "MASTER"
  >("DASHBOARD");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPickupId, setSelectedPickupId] = useState<string | null>(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const {
    dataList,
    loading,
    page,
    setPage,
    limit,
    totalData,
    selectedOutletId,
    setSelectedOutletId,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    refreshData,
  } = useOrderData({ activeTab, roleCode, userOutletId });

  const dashboardStats = useDashboardStats(roleCode, selectedOutletId);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memuat data pengguna...
      </div>
    );
  }

  if (!roleCode) return null;

  const handleViewDetail = (id: string) => {
    setSelectedOrderId(id);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-16 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        roleCode={roleCode}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "DASHBOARD" && (
          <DashboardView
            roleCode={roleCode}
            onNavigate={(tab) => setActiveTab(tab as any)}
            onProcessPickup={() => setActiveTab("PICKUP")}
            onProcessBypass={() => setActiveTab("BYPASS")}
            stats={dashboardStats}
          />
        )}

        {(activeTab === "ORDERS" || activeTab === "PICKUP") && (
          <OrderListView
            title={
              activeTab === "ORDERS" ? "Order Management" : "Pickup Requests"
            }
            isPickupTab={activeTab === "PICKUP"}
            data={dataList}
            loading={loading}
            page={page}
            limit={limit}
            totalData={totalData}
            onPageChange={setPage}
            roleCode={roleCode}
            selectedOutletId={selectedOutletId}
            onOutletChange={
              roleCode === "SUPER_ADMIN" ? setSelectedOutletId : undefined
            }
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            onCreateOrder={
              activeTab === "PICKUP"
                ? (id) => {
                    setSelectedPickupId(id);
                    setShowCreateModal(true);
                  }
                : undefined
            }
            onRefresh={refreshData}
            onViewDetail={handleViewDetail}
          />
        )}

        {activeTab === "BYPASS" && (
          <BypassListView
            data={dataList}
            loading={loading}
            page={page}
            limit={limit}
            totalData={totalData}
            onPageChange={setPage}
            onRefresh={refreshData}
            roleCode={roleCode}
            selectedOutletId={selectedOutletId}
            onOutletChange={
              roleCode === "SUPER_ADMIN" ? setSelectedOutletId : undefined
            }
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
        )}

        {activeTab === "REPORT" && (
          <ReportSection roleCode={roleCode} userOutletId={userOutletId} />
        )}
        {activeTab === "MASTER" && roleCode === "SUPER_ADMIN" && (
          <MasterDataSection />
        )}
      </main>

      <CreateOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        pickupId={selectedPickupId}
        onSuccess={() => {
          refreshData();
          setActiveTab("ORDERS");
        }}
      />

      <OrderDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        orderId={selectedOrderId}
      />
    </div>
  );
}
