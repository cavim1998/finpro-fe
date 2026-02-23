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

export type WorkerOrderDetail = {
  id: string;
  orderNo?: string;
  orderNumber?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  totalAmount?: number;
  totalKg?: number;
  clothesCount?: number;
  customer?: {
    id?: string;
    name?: string;
    fullName?: string;
    email?: string;
  };
  outlet?: {
    id?: number;
    name?: string;
  };
  items?: Array<{
    id?: number;
    itemId?: number;
    qty?: number;
    price?: number;
    item?: {
      id?: number;
      name?: string;
      price?: number;
    };
    name?: string;
  }>;
  stations?: Array<{
    id?: number;
    stationType?: StationType;
    status?: string;
    startedAt?: string;
    completedAt?: string;
    worker?: {
      id?: string;
      name?: string;
      fullName?: string;
      email?: string;
    };
  }>;
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

async function claimOrder(params: { stationType: StationType; orderStationId: number }) {
  const { stationType, orderStationId } = params;
  const res = await axiosInstance.post(`/worker/stations/${stationType}/${orderStationId}/claim`);
  return res.data?.data;
}

async function getWorkerOrderDetail(orderId: string) {
  const res = await axiosInstance.get(`/worker/orders/${orderId}`);
  return (res.data?.data ?? res.data) as WorkerOrderDetail;
}

async function completeOrderStation(params: {
  stationType: StationType;
  orderId: string;
  itemCounts: Array<{ itemId: number; qty: number }>;
}) {
  const { stationType, orderId, itemCounts } = params;
  const res = await axiosInstance.post(`/worker/stations/${stationType}/${orderId}/complete`, {
    itemCounts,
  });
  return res.data?.data;
}

async function bypassOrderStation(params: {
  stationType: StationType;
  orderId: string;
  reason: string;
  itemCounts: Array<{ itemId: number; qty: number }>;
}) {
  const { stationType, orderId, reason, itemCounts } = params;
  const res = await axiosInstance.post(`/worker/stations/${stationType}/${orderId}/bypass`, {
    reason,
    itemCounts,
  });
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

export function useWorkerOrderDetailQuery(orderId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["worker", "order-detail", orderId],
    queryFn: () => getWorkerOrderDetail(orderId),
    enabled: (options?.enabled ?? true) && !!orderId,
    staleTime: 3_000,
  });
}

export function useCompleteWorkerOrderMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: completeOrderStation,
    onSuccess: async (_data, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["worker", "order-detail", vars.orderId] }),
        qc.invalidateQueries({ queryKey: ["worker", "station-stats", vars.stationType] }),
        qc.invalidateQueries({ queryKey: ["worker", "station-orders", vars.stationType] }),
      ]);
    },
  });
}

export function useBypassWorkerOrderMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: bypassOrderStation,
    onSuccess: async (_data, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["worker", "order-detail", vars.orderId] }),
        qc.invalidateQueries({ queryKey: ["worker", "station-stats", vars.stationType] }),
        qc.invalidateQueries({ queryKey: ["worker", "station-orders", vars.stationType] }),
      ]);
    },
  });
}
