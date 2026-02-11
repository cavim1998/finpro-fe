"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  claimPickupApi,
  startTaskApi,
  pickupPickedUpApi,
  pickupArrivedApi,
  type DriverDashboardParams,
} from "./driver.api";

export const driverDashboardKey = (params: DriverDashboardParams) =>
  ["driverDashboard", params] as const;

export function useClaimPickupMutation(params: DriverDashboardParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pickupId: number) => claimPickupApi(pickupId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: driverDashboardKey(params) });
    },
  });
}

export function useStartTaskMutation(params: DriverDashboardParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => startTaskApi(taskId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: driverDashboardKey(params) });
    },
  });
}

export function usePickupPickedUpMutation(params: DriverDashboardParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => pickupPickedUpApi(taskId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: driverDashboardKey(params) });
    },
  });
}

export function usePickupArrivedMutation(params: DriverDashboardParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => pickupArrivedApi(taskId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: driverDashboardKey(params) });
    },
  });
}