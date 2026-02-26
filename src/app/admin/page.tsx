"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Navbar from "@/components/admin/Navbar";
import DashboardView from "@/components/admin/DashboardView";
import { OrderListView } from "@/components/admin/OrderListView";
import ReportSection from "@/components/admin/ReportSection";
import MasterDataSection from "@/components/admin/MasterDataSection";
import CreateOrderModal from "@/components/admin/modal/CreateOrderModal";
import BypassListView from "@/components/admin/BypassListView";
import OrderDetailModal from "@/components/admin/modal/OrderDetailModal";
import { useAdminAuth } from "./hooks/useAdminAuth";
import { useOrderData } from "./hooks/useOrderData";
import { useDashboardStats } from "@/components/admin/dashboard/useDashboardStats";
import { useOutlets } from "@/hooks/api/useOutlet";
import { useQueryFilters } from "@/hooks/use-query-filters";

type TabType =
  | "DASHBOARD"
  | "ORDERS"
  | "PICKUP"
  | "BYPASS"
  | "REPORT"
  | "MASTER";

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { roleCode, userOutletId, isAuthLoading } = useAdminAuth();
  const rawTab = searchParams.get("tab")?.toUpperCase();
  const validTabs: TabType[] = [
    "DASHBOARD",
    "ORDERS",
    "PICKUP",
    "BYPASS",
    "REPORT",
    "MASTER",
  ];
  const activeTab = validTabs.includes(rawTab as TabType)
    ? (rawTab as TabType)
    : "DASHBOARD";

  const handleTabChange = useCallback(
    (newTab: TabType) => {
      const params = new URLSearchParams();
      params.set("tab", newTab);
      if (newTab === "MASTER") {
        params.set("view", "USERS");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router],
  );

  const filterPrefix = activeTab === "PICKUP" ? "pickup" : "order";
  const filters = useQueryFilters(filterPrefix);
  const statusParamKey = `${filterPrefix}Status`;
  const currentStatus = searchParams.get(statusParamKey) || "";
  const isOrderCreatedKey = "pickupIsOrderCreated";
  const currentIsOrderCreated = searchParams.get(isOrderCreatedKey) || "";

  const handleStatusChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set(statusParamKey, val);
    } else {
      params.delete(statusParamKey);
    }
    params.set(`${filterPrefix}Page`, "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { data: outletsResponse } = useOutlets();
  const { dataList, loading, totalData, refreshData } = useOrderData({
    activeTab,
    roleCode,
    userOutletId,
    page: filters.page,
    limit: 10,
    search: filters.search,
    outletId: filters.outletId,
    sortBy:
      activeTab === "ORDERS" || activeTab === "PICKUP" || activeTab === "BYPASS"
        ? filters.sortBy === "name"
          ? activeTab === "BYPASS"
            ? "requestedAt"
            : "createdAt"
          : filters.sortBy
        : filters.sortBy,
    sortOrder: filters.sortOrder,
    status: currentStatus,
    isOrderCreated: activeTab === "PICKUP" ? currentIsOrderCreated : undefined,
  });

  const dashboardStats = useDashboardStats(roleCode, filters.outletId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPickupId, setSelectedPickupId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleIsOrderCreatedChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set(isOrderCreatedKey, val);
    } else {
      params.delete(isOrderCreatedKey);
    }
    params.set("pickupPage", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleViewDetail = (id: string) => {
    setSelectedOrderId(id);
    setShowDetailModal(true);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memuat data pengguna...
      </div>
    );
  }

  if (!roleCode) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-16 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => handleTabChange(tab as TabType)}
        roleCode={roleCode}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "DASHBOARD" && (
          <DashboardView
            roleCode={roleCode}
            onNavigate={(tab) => handleTabChange(tab as TabType)}
            onProcessPickup={() => handleTabChange("PICKUP")}
            onProcessBypass={() => handleTabChange("BYPASS")}
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
            totalData={totalData}
            roleCode={roleCode}
            outlets={outletsResponse?.data || []}
            page={filters.page}
            onPageChange={filters.setPage}
            limit={10}
            search={filters.search}
            onSearchChange={filters.setSearch}
            outletId={filters.outletId}
            onOutletChange={filters.setOutletId}
            status={currentStatus}
            onStatusChange={handleStatusChange}
            sortBy={filters.sortBy}
            onSortByChange={(val) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set(`${filterPrefix}SortBy`, val);
              params.set(`${filterPrefix}Page`, "1");
              router.replace(`${pathname}?${params.toString()}`, {
                scroll: false,
              });
            }}
            sortOrder={filters.sortOrder}
            onSortOrderChange={filters.setSortOrder}
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
            isOrderCreated={currentIsOrderCreated}
            onIsOrderCreatedChange={handleIsOrderCreatedChange}
          />
        )}

        {activeTab === "BYPASS" && (
          <BypassListView
            data={dataList}
            loading={loading}
            page={filters.page}
            limit={10}
            totalData={totalData}
            onPageChange={filters.setPage}
            onRefresh={refreshData}
            roleCode={roleCode}
            selectedOutletId={filters.outletId}
            onOutletChange={filters.setOutletId}
            selectedStatus={currentStatus}
            onStatusChange={handleStatusChange}
            search={filters.search}
            onSearchChange={filters.setSearch}
            outlets={outletsResponse?.data || []}
          />
        )}

        {activeTab === "REPORT" && (
          <ReportSection roleCode={roleCode} userOutletId={userOutletId} />
        )}

        {activeTab === "MASTER" && roleCode === "SUPER_ADMIN" && (
          <MasterDataSection />
        )}
      </main>

      {/* --- MODALS --- */}
      <CreateOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        pickupId={selectedPickupId}
        onSuccess={() => {
          refreshData();
          handleTabChange("ORDERS");
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
