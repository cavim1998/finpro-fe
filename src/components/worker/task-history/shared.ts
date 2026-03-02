"use client";

import type { WorkerTaskHistoryItem } from "@/hooks/api/useWorkerTaskHistory";

export function formatDateTime(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatus(item: WorkerTaskHistoryItem) {
  return item.stationStatus || item.status || "COMPLETED";
}

export function getCustomerName(item: WorkerTaskHistoryItem) {
  return item.customerName || item.customer?.fullName || item.customer?.name || "-";
}

export function getOrderNumber(item: WorkerTaskHistoryItem) {
  return item.orderNo || item.orderNumber || item.orderId || "-";
}

export function getPrimaryTimestamp(item: WorkerTaskHistoryItem) {
  return (
    item.completedAt ||
    item.taskDate ||
    item.updatedAt ||
    item.startedAt ||
    item.enteredAt ||
    item.createdAt ||
    null
  );
}

export function getDetailHref(item: WorkerTaskHistoryItem, stationPath: string) {
  if (!item.orderId) return null;

  return `${stationPath}/history/order/${encodeURIComponent(item.orderId)}`;
}
