import type { StationStatus } from "@/types";

export type WorkerStationStats = {
  incoming: number;
  inProgress: number;
  completed: number;
};

export type WorkerOrderCard = {
  orderStationId: number;
  orderId: string;
  orderNo: string;
  customerName: string;

  clothesCount: number;
  totalKg: number;

  enteredAt: string; // ISO string
  stationStatus: StationStatus;
};

export type CompleteStationPayload = {
  itemCounts: Array<{ itemId: number; qty: number }>;
};

export type RequestBypassPayload = {
  reason: string;
};