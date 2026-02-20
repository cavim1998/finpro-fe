"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  claimOrderApi,
  getStationOrdersApi,
  getStationStatsApi,
  type GetStationOrdersParams,
  type StationTypeCode,
} from "./worker.api";

export const workerStationStatsKey = (stationType: StationTypeCode) =>
  ["workerStationStats", stationType] as const;

export const workerStationOrdersKey = (params: GetStationOrdersParams) =>
  ["workerStationOrders", params] as const;

export function useWorkerStationStats(stationType: StationTypeCode) {
  return useQuery({
    queryKey: workerStationStatsKey(stationType),
    queryFn: async () => {
      const res = await getStationStatsApi(stationType);
      return res?.data ?? res;
    },
    retry: 1,
  });
}

export function useWorkerStationOrders(params: GetStationOrdersParams) {
  return useQuery({
    queryKey: workerStationOrdersKey(params),
    queryFn: async () => {
      const res = await getStationOrdersApi(params);
      return res?.data ?? res;
    },
    retry: 1,
  });
}

export function useClaimOrderMutation(stationType: StationTypeCode) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => claimOrderApi(stationType, orderId),
    onSuccess: async () => {
      // refresh stats + incoming + my (semua page)
      await qc.invalidateQueries({ queryKey: workerStationStatsKey(stationType) });
      await qc.invalidateQueries({ queryKey: ["workerStationOrders"] });
    },
  });
}