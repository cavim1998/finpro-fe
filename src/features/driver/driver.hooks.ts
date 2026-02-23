"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  claimDeliveryApi,
  claimPickupApi,
  completeDeliveryApi,
  getDriverOrderDetailApi,
  type DriverOrderDetailParams,
  startTaskApi,
  pickupPickedUpApi,
  pickupArrivedApi,
  type DriverDashboardParams,
} from "./driver.api";

export const driverDashboardKey = (params: DriverDashboardParams) =>
  ["driverDashboard", params] as const;
export const driverOrderDetailKey = (params: DriverOrderDetailParams) =>
  ["driverOrderDetail", params] as const;

export function useDriverOrderDetailQuery(params: DriverOrderDetailParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: driverOrderDetailKey(params),
    queryFn: async () => {
      const payload = await getDriverOrderDetailApi(params);
      return payload?.data ?? payload;
    },
    enabled: (options?.enabled ?? true) && Number.isFinite(params.id),
    retry: 1,
  });
}

export function useClaimPickupMutation(params: DriverDashboardParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pickupId: string) => claimPickupApi(pickupId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: driverDashboardKey(params) });
    },
  });
}

export function useClaimDeliveryMutation(params: DriverDashboardParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => claimDeliveryApi(orderId),
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

export function usePickupArrivedDirectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskOrPickupId: number) => pickupArrivedApi(taskOrPickupId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["driverDashboard"] });
    },
  });
}

export function useCompleteDeliveryDirectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => completeDeliveryApi(taskId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["driverDashboard"] });
    },
  });
}
