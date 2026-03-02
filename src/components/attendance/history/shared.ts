"use client";

import type { AttendanceHistoryItem } from "@/hooks/api/useAttendanceHistory";

export function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    startDate: formatDateInput(start),
    endDate: formatDateInput(end),
  };
}

export function getDatesInRange(startDate?: string, endDate?: string) {
  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate);
  if (!start || !end || start > end) return [];

  const dates: string[] = [];
  const cursor = new Date(end);

  while (cursor >= start) {
    dates.push(getDateKey(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }

  return dates;
}

export function getTargetPageForDate(dates: string[], targetDate: string, pageSize: number) {
  const targetIndex = dates.indexOf(targetDate);
  if (targetIndex === -1) return 1;
  return Math.floor(targetIndex / pageSize) + 1;
}

export function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildDisplayItems(
  visibleDateKeys: string[],
  itemsByDate: Map<string, AttendanceHistoryItem>,
) {
  return visibleDateKeys.map((dateKey) => {
    const existing = itemsByDate.get(dateKey);
    if (existing) return existing;

    return {
      id: 0,
      date: `${dateKey}T00:00:00.000Z`,
      clockInAt: null,
      clockOutAt: null,
      notes: null,
    } as AttendanceHistoryItem;
  });
}

function parseDateInput(value?: string | null) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}
