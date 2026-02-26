import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAdminAuth } from "./useAdminAuth";
import { useOrderData } from "./useOrderData";
import { useDashboardStats } from "@/components/admin/dashboard/useDashboardStats";
import { useOutlets } from "@/hooks/api/useOutlet";
import { useQueryFilters } from "@/hooks/use-query-filters";

export type TabType =
  | "DASHBOARD"
  | "ORDERS"
  | "PICKUP"
  | "BYPASS"
  | "REPORT"
  | "MASTER";

export const useAdminDashboardLogic = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { roleCode, userOutletId, isAuthLoading } = useAdminAuth();

  const rawTab = searchParams.get("tab")?.toUpperCase();
  const activeTab: TabType = [
    "DASHBOARD",
    "ORDERS",
    "PICKUP",
    "BYPASS",
    "REPORT",
    "MASTER",
  ].includes(rawTab as any)
    ? (rawTab as TabType)
    : "DASHBOARD";

  useEffect(() => {
    orderData.refreshData();
  }, [activeTab]);

  const handleTabChange = useCallback(
    (newTab: TabType) => {
      const params = new URLSearchParams();
      params.set("tab", newTab);
      if (newTab === "MASTER") params.set("view", "USERS");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const filterPrefix = activeTab === "PICKUP" ? "pickup" : "order";
  const filters = useQueryFilters(filterPrefix);
  const statusParamKey = `${filterPrefix}Status`;
  const currentStatus = searchParams.get(statusParamKey) || "";
  const isOrderCreatedKey = "pickupIsOrderCreated";
  const currentIsOrderCreated = searchParams.get(isOrderCreatedKey) || "";

  const updateUrlParam = (
    key: string,
    value: string | undefined,
    resetPage = true,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);

    if (resetPage) params.set(`${filterPrefix}Page`, "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlers = {
    onStatusChange: (val: string) => updateUrlParam(statusParamKey, val),
    onIsOrderCreatedChange: (val: string) =>
      updateUrlParam(isOrderCreatedKey, val),
    onSortByChange: (val: string) =>
      updateUrlParam(`${filterPrefix}SortBy`, val),
  };

  const resolveSortBy = () => {
    if (["ORDERS", "PICKUP", "BYPASS"].includes(activeTab)) {
      if (filters.sortBy === "name") {
        return activeTab === "BYPASS" ? "requestedAt" : "createdAt";
      }
    }
    return filters.sortBy;
  };

  const effectiveSortOrder = (filters.sortOrder as "asc" | "desc") || "desc";

  const { data: outletsResponse } = useOutlets();
  const orderData = useOrderData({
    activeTab,
    roleCode,
    userOutletId,
    page: filters.page,
    limit: 10,
    search: filters.search,
    outletId: filters.outletId,
    sortBy: resolveSortBy(),
    sortOrder: effectiveSortOrder,
    status: currentStatus,
    isOrderCreated: activeTab === "PICKUP" ? currentIsOrderCreated : undefined,
  });

  const dashboardStats = useDashboardStats(roleCode, filters.outletId);

  const [modals, setModals] = useState({
    createOrder: false,
    detailOrder: false,
    selectedPickupId: null as string | null,
    selectedOrderId: null as string | null,
  });

  const modalHandlers = {
    openCreateOrder: (id: string) =>
      setModals((prev) => ({
        ...prev,
        createOrder: true,
        selectedPickupId: id,
      })),
    closeCreateOrder: () =>
      setModals((prev) => ({
        ...prev,
        createOrder: false,
        selectedPickupId: null,
      })),
    openDetailOrder: (id: string) =>
      setModals((prev) => ({
        ...prev,
        detailOrder: true,
        selectedOrderId: id,
      })),
    closeDetailOrder: () =>
      setModals((prev) => ({
        ...prev,
        detailOrder: false,
        selectedOrderId: null,
      })),
  };

  return {
    auth: { roleCode, userOutletId, isLoading: isAuthLoading },
    navigation: { activeTab, handleTabChange },
    filters: { ...filters, currentStatus, currentIsOrderCreated },
    data: {
      list: orderData.dataList,
      loading: orderData.loading,
      total: orderData.totalData,
      refresh: orderData.refreshData,
      outlets: outletsResponse?.data || [],
      stats: dashboardStats,
    },
    handlers,
    modals,
    modalHandlers,
  };
};
