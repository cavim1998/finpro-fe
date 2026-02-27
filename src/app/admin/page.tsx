"use client";

import Navbar from "@/components/admin/Navbar";
import DashboardView from "@/components/admin/DashboardView";
import { OrderListView } from "@/components/admin/OrderListView";
import ReportSection from "@/components/admin/ReportSection";
import MasterDataSection from "@/components/admin/MasterDataSection";
import CreateOrderModal from "@/components/admin/modal/CreateOrderModal";
import BypassListView from "@/components/admin/BypassListView";
import OrderDetailModal from "@/components/admin/modal/OrderDetailModal";
import { useAdminDashboardLogic } from "./hooks/useAdminDashboardLogic";

export default function AdminDashboardPage() {
  const { auth, navigation, filters, data, handlers, modals, modalHandlers } =
    useAdminDashboardLogic();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memuat data pengguna...
      </div>
    );
  }

  if (!auth.roleCode) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-16 font-sans">
      <Navbar
        activeTab={navigation.activeTab}
        setActiveTab={navigation.handleTabChange}
        roleCode={auth.roleCode}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {navigation.activeTab === "DASHBOARD" && (
          <DashboardView
            roleCode={auth.roleCode}
            onNavigate={navigation.handleTabChange}
            onProcessPickup={() => navigation.handleTabChange("PICKUP")}
            onProcessBypass={() => navigation.handleTabChange("BYPASS")}
            stats={data.stats}
          />
        )}

        {(navigation.activeTab === "ORDERS" ||
          navigation.activeTab === "PICKUP") && (
          <OrderListView
            title={
              navigation.activeTab === "ORDERS"
                ? "Order Management"
                : "Pickup Requests"
            }
            isPickupTab={navigation.activeTab === "PICKUP"}
            data={data.list}
            loading={data.loading}
            totalData={data.total}
            roleCode={auth.roleCode}
            outlets={data.outlets}
            page={filters.page}
            onPageChange={filters.setPage}
            limit={10}
            search={filters.search}
            onSearchChange={filters.setSearch}
            outletId={filters.outletId}
            onOutletChange={filters.setOutletId}
            status={filters.currentStatus}
            onStatusChange={handlers.onStatusChange}
            sortBy={filters.sortBy}
            onSortByChange={handlers.onSortByChange}
            sortOrder={filters.sortOrder}
            onSortOrderChange={filters.setSortOrder}
            onCreateOrder={
              navigation.activeTab === "PICKUP"
                ? modalHandlers.openCreateOrder
                : undefined
            }
            onRefresh={data.refresh}
            onViewDetail={modalHandlers.openDetailOrder}
            isOrderCreated={filters.currentIsOrderCreated}
            onIsOrderCreatedChange={handlers.onIsOrderCreatedChange}
          />
        )}

        {navigation.activeTab === "BYPASS" && (
          <BypassListView
            data={data.list}
            loading={data.loading}
            totalData={data.total}
            roleCode={auth.roleCode}
            onRefresh={data.refresh}
            outlets={data.outlets}
            page={filters.page}
            limit={10}
            onPageChange={filters.setPage}
            selectedOutletId={filters.outletId}
            onOutletChange={filters.setOutletId}
            selectedStatus={filters.currentStatus}
            onStatusChange={handlers.onStatusChange}
            search={filters.search}
            onSearchChange={filters.setSearch}
          />
        )}

        {navigation.activeTab === "REPORT" && (
          <ReportSection
            roleCode={auth.roleCode}
            userOutletId={auth.userOutletId}
          />
        )}

        {navigation.activeTab === "MASTER" &&
          auth.roleCode === "SUPER_ADMIN" && <MasterDataSection />}
      </main>

      <CreateOrderModal
        isOpen={modals.createOrder}
        onClose={modalHandlers.closeCreateOrder}
        pickupId={modals.selectedPickupId}
        onSuccess={() => {
          data.refresh();
          navigation.handleTabChange("ORDERS");
        }}
      />

      <OrderDetailModal
        isOpen={modals.detailOrder}
        onClose={modalHandlers.closeDetailOrder}
        orderId={modals.selectedOrderId}
      />
    </div>
  );
}
