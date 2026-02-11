"use client";

import { useQuery } from "@tanstack/react-query";
import { getDriverDashboardApi, type DriverDashboardQuery } from "./driver.api";

export function useDriverDashboard(q: DriverDashboardQuery) {
  return useQuery({
    queryKey: ["driver-dashboard", q],
    queryFn: async () => {
      const res = await getDriverDashboardApi(q);
      return res?.data ?? res;
    },
    retry: 1,
  });
}