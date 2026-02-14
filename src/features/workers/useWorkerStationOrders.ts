"use client";

import { useQuery } from "@tanstack/react-query";
import type { StationType } from "@/types";
import { getWorkerStationOrders, type WorkerOrderKind } from "./worker.api";

export function useWorkerStationOrders({
  stationType,
  kind,
  enabled = true,
}: {
  stationType: StationType;
  kind: WorkerOrderKind;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["worker-station-orders", stationType, kind],
    queryFn: () => getWorkerStationOrders(stationType, kind),
    enabled,
    staleTime: 10_000,
    retry: 1,
  });
}