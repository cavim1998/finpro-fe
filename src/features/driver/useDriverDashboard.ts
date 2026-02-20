"use client";

import { useQuery } from "@tanstack/react-query";
import type { DriverDashboardParams } from "./driver.api";
import { getDriverDashboardApi } from "./driver.api";

export type DriverDashboardResponse = {
  stats: { incoming: number; inProgress: number; completed: number };
  tasks: {
    items: any[];
    total?: number;
    totalPages?: number;
    page?: number;
    pageSize?: number;
  };
  pickupRequests: {
    items: any[];
    total?: number;
    totalPages?: number;
    page?: number;
    pageSize?: number;
  };
};

export const driverDashboardKey = (params: DriverDashboardParams) =>
  ["driverDashboard", params] as const;

export function useDriverDashboard(params: DriverDashboardParams) {
  return useQuery<DriverDashboardResponse>({
    queryKey: driverDashboardKey(params),
    queryFn: async () => {
      const payload = await getDriverDashboardApi(params);
      return (payload?.data ?? payload) as DriverDashboardResponse;
    },
    retry: 1,
  });
}
