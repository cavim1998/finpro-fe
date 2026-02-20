"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  claimPickupApi,
  startTaskApi,
  pickupPickedUpApi,
  pickupArrivedApi,
} from "./driver.api";

function invalidateAllDriverDashboards(qc: ReturnType<typeof useQueryClient>) {
  return qc.invalidateQueries({ queryKey: ["driverDashboard"] });
}

export function useClaimPickup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pickupId: number) => claimPickupApi(pickupId),
    onSuccess: async () => {
      await invalidateAllDriverDashboards(qc);
    },
  });
}

export function useStartTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => startTaskApi(taskId),
    onSuccess: async () => {
      await invalidateAllDriverDashboards(qc);
    },
  });
}

export function usePickupPickedUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => pickupPickedUpApi(taskId),
    onSuccess: async () => {
      await invalidateAllDriverDashboards(qc);
    },
  });
}

export function usePickupArrivedOutlet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => pickupArrivedApi(taskId),
    onSuccess: async () => {
      await invalidateAllDriverDashboards(qc);
    },
  });
}

export const usePickupArrived = usePickupArrivedOutlet;