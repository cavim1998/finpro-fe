import { useState, useEffect } from "react";
import { getDashboardStats } from "@/services/dashboard.service";
import { RoleCode } from "@/types";

export const useDashboardStats = (
  roleCode: RoleCode | null,
  outletId?: number,
) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    activePickups: 0,
    pendingBypass: 0,
    todayRevenue: 0,
    newCustomers: 0,
    outletPerformance: 0,
  });

  useEffect(() => {
    if (!roleCode) return;

    getDashboardStats(outletId)
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Gagal load stats:", err));
  }, [roleCode, outletId]);

  return stats;
};
