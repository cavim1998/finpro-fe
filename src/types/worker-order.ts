export type WorkerStationKey = "WASHING" | "IRONING" | "PACKING";

export type WorkerOrderListItem = {
  id: string | number;

  orderNo: string; // "ORD-2026-0001"
  customerName: string;

  clothesCount: number;
  totalKg: number;

  enteredAt: string; // ISO string
  station: WorkerStationKey; // WASHING/IRONING/PACKING
};