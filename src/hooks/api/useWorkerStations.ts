"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type { StationType } from "@/types";

/**
 * Sesuaikan kalau kamu sudah punya enum/type StationStatus di "@/types"
 * Kalau belum, minimal pakai string union dulu.
 */
export type StationStatus = "PENDING" | "IN_PROGRESS" | "WAITING_BYPASS" | "COMPLETED";

export type WorkerStationStats = {
  incoming: number;
  inProgress: number;
  completed: number;
};

export type WorkerOrderListItem = {
  // dari WorkerService.getOrders() kamu
  orderStationId: number;
  orderId: string;
  orderNo: string;
  customerName: string;
  clothesCount: number;
  totalKg: string | number; // Decimal sering jadi string
  enteredAt: string;        // ISO string
  stationStatus: StationStatus;
};

async function getStationStats(stationType: StationType) {
  const res = await axiosInstance.get(`/worker/stations/${stationType}/stats`);
  return res.data?.data as WorkerStationStats;
}

async function getStationOrders(params: {
  stationType: StationType;
  scope: "incoming" | "my" | "completed";
  page?: number;
  limit?: number;
}) {
  const { stationType, scope, page = 1, limit = 10 } = params;
  const res = await axiosInstance.get(`/worker/stations/${stationType}/orders`, {
    params: { scope, page, limit },
  });
  return res.data?.data as WorkerOrderListItem[];
}

async function claimOrder(params: { stationType: StationType; orderId: string }) {
  const { stationType, orderId } = params;
  const res = await axiosInstance.post(`/worker/stations/${stationType}/${orderId}/claim`);
  return res.data?.data;
}

export function useWorkerStationStatsQuery(
  stationType: StationType,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["worker", "station-stats", stationType],
    queryFn: () => getStationStats(stationType),
    enabled: options?.enabled ?? true,
    staleTime: 5_000,
  });
}

export function useWorkerStationOrdersQuery(
  stationType: StationType,
  scope: "incoming" | "my" | "completed",
  options?: { enabled?: boolean; page?: number; limit?: number }
) {
  return useQuery({
    queryKey: ["worker", "station-orders", stationType, scope, options?.page ?? 1, options?.limit ?? 10],
    queryFn: () =>
      getStationOrders({
        stationType,
        scope,
        page: options?.page ?? 1,
        limit: options?.limit ?? 10,
      }),
    enabled: options?.enabled ?? true,
    staleTime: 3_000,
  });
}

export function useClaimWorkerOrderMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: claimOrder,
    onSuccess: async (_data, vars) => {
      // setelah claim: refresh stats + orders incoming + my
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["worker", "station-stats", vars.stationType] }),
        qc.invalidateQueries({ queryKey: ["worker", "station-orders", vars.stationType, "incoming"] }),
        qc.invalidateQueries({ queryKey: ["worker", "station-orders", vars.stationType, "my"] }),
      ]);
    },
  });
}