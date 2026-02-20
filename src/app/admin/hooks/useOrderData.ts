import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getOrders, getPickups } from "@/services/order.service";
import { RoleCode } from "@/types";

interface UseOrderDataProps {
  activeTab: string;
  roleCode: RoleCode | null;
  userOutletId?: number;
}

export const useOrderData = ({
  activeTab,
  roleCode,
  userOutletId,
}: UseOrderDataProps) => {
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalData, setTotalData] = useState(0);

  const [selectedOutletId, setSelectedOutletId] = useState<number | undefined>(
    undefined,
  );
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (roleCode === "OUTLET_ADMIN" && userOutletId) {
      setSelectedOutletId(userOutletId);
    }
  }, [roleCode, userOutletId]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, selectedOutletId, selectedStatus, sortBy, sortOrder]);

  const fetchData = useCallback(async () => {
    if (!roleCode) return;

    if (
      (activeTab === "ORDERS" || activeTab === "PICKUP") &&
      roleCode === "SUPER_ADMIN" &&
      !selectedOutletId
    ) {
      setDataList([]);
      setTotalData(0);
      return;
    }

    setLoading(true);
    try {
      const params = {
        page,
        limit,
        outletId: selectedOutletId,
        status: selectedStatus || undefined,
        sortBy,
        sortOrder,
      };

      let res: any = null;
      if (activeTab === "ORDERS") {
        res = await getOrders(params);
      } else if (activeTab === "PICKUP") {
        res = await getPickups(params);
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
    selectedOutletId,
    selectedStatus,
    sortBy,
    sortOrder,
    page,
    limit,
  ]);

  useEffect(() => {
    if (activeTab === "ORDERS" || activeTab === "PICKUP") {
      fetchData();
    }
  }, [fetchData, activeTab]);

  return {
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
    refreshData: fetchData,
  };
};
