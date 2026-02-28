"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export type WorkerTaskHistoryQuery = {
  outletStaffId: number;
  page: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
};

export type WorkerTaskHistoryItem = {
  id?: number | string;
  orderStationId?: number | string;
  orderId?: string;
  orderNo?: string;
  orderNumber?: string;
  customerName?: string;
  customer?: {
    name?: string;
    fullName?: string;
  };
  stationType?: string;
  stationStatus?: string;
  status?: string;
  clothesCount?: number | null;
  totalKg?: number | string | null;
  enteredAt?: string;
  startedAt?: string;
  completedAt?: string;
  taskDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type WorkerTaskHistoryResponse = {
  outletStaffId?: number;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  filter?: {
    startDate?: string;
    endDate?: string;
    search?: string;
  };
  items: WorkerTaskHistoryItem[];
};

function normalizeResponse(raw: unknown): WorkerTaskHistoryResponse {
  if (Array.isArray(raw)) {
    return { items: raw as WorkerTaskHistoryItem[] };
  }

  const payload = (raw ?? {}) as Partial<WorkerTaskHistoryResponse> & {
    data?: WorkerTaskHistoryItem[];
  };

  return {
    ...payload,
    items: Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.data)
        ? payload.data
        : [],
  };
}

export function useWorkerTaskHistoryQuery(
  params: WorkerTaskHistoryQuery,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["worker", "task-history", params],
    queryFn: async () => {
      const res = await axiosInstance.get("/worker/task-history", {
        params: {
          outletStaffId: params.outletStaffId,
          page: params.page,
          limit: params.limit ?? 5,
          startDate: params.startDate,
          endDate: params.endDate,
          search: params.search,
        },
      });

      return normalizeResponse(res.data?.data ?? res.data);
    },
    enabled: (options?.enabled ?? true) && !!params.outletStaffId,
    staleTime: 3_000,
  });
}
