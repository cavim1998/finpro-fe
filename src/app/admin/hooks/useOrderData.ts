import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getOrders, getPickups } from "@/services/order.service";
import { RoleCode } from "@/types";
import { getBypassRequests } from "@/services/bypass.service";

interface UseOrderDataProps {
  activeTab: string;
  roleCode: RoleCode | null;
  userOutletId?: number;
  page: number;
  limit: number;
  search: string;
  status: string;
  outletId?: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  isOrderCreated?: string;
}

export const useOrderData = ({
  activeTab,
  roleCode,
  userOutletId,
  page,
  limit,
  search,
  status,
  outletId,
  sortBy,
  sortOrder,
  isOrderCreated,
}: UseOrderDataProps) => {
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalData, setTotalData] = useState(0);

  const fetchData = useCallback(async () => {
    if (!roleCode) return;

    setLoading(true);
    try {
      setDataList([]);
      const effectiveOutletId =
        outletId || (roleCode === "OUTLET_ADMIN" ? userOutletId : undefined);

      const params = {
        page,
        limit,
        outletId: effectiveOutletId,
        status: status || undefined,
        sortBy,
        sortOrder,
        search,
        isOrderCreated: activeTab === "PICKUP" ? isOrderCreated : undefined,
      };

      let res: any = null;
      if (activeTab === "ORDERS") {
        res = await getOrders(params);
      } else if (activeTab === "PICKUP") {
        res = await getPickups(params);
      } else if (activeTab === "BYPASS") {
        res = await getBypassRequests(params);
      }

      if (res?.data && res?.meta) {
        setDataList(res.data);
        setTotalData(res.meta.total);
      } else {
        const list = Array.isArray(res) ? res : [];
        setDataList(list);
        setTotalData(list.length);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal mengambil data terbaru");
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    roleCode,
    userOutletId,
    page,
    limit,
    search,
    status,
    outletId,
    sortBy,
    sortOrder,
    isOrderCreated,
  ]);

  useEffect(() => {
    if (
      activeTab === "ORDERS" ||
      activeTab === "PICKUP" ||
      activeTab === "BYPASS"
    ) {
      fetchData();
    }
  }, [fetchData, activeTab]);

  return {
    dataList,
    loading,
    totalData,
    refreshData: fetchData,
  };
};
