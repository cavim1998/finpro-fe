"use client";

import type { WorkerHeaderTheme } from "@/components/worker/WorkerHeader";
import type { StationType } from "@/types";

const stationTitleMap: Record<StationType, string> = {
  WASHING: "Washing Station",
  IRONING: "Ironing Station",
  PACKING: "Packing Station",
};

export type WorkerDashboardCopy = {
  headerTitle: string;
  headerSubtitle?: string;
  clockOutLabel: string;
  statsLabels: {
    incoming: string;
    inProgress: string;
    completed: string;
  };
  listsLabels: {
    myTasksTitle: string;
    incomingTitle: string;
    viewAll: string;
    emptyMyTasks: string;
    emptyIncoming: string;
  };
};

export type WorkerDashboardTheme = WorkerHeaderTheme;

export function formatTime(value?: Date | string | null) {
  if (!value) return "-";

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function getOutletStaffId(profile: unknown): number | null {
  const data = (profile ?? {}) as {
    outletStaffId?: number | string | null;
    outletStaff?: { id?: number | string | null };
    staff?: { id?: number | string | null };
  };

  const value = data.outletStaffId ?? data.outletStaff?.id ?? data.staff?.id ?? null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function normalizeStation(raw?: unknown): StationType | null {
  if (!raw) return null;

  const value = String(raw).toUpperCase();
  if (value.includes("WASHING")) return "WASHING";
  if (value.includes("IRONING")) return "IRONING";
  if (value.includes("PACKING")) return "PACKING";
  return null;
}

export function getDefaultCopy(station: StationType): WorkerDashboardCopy {
  return {
    headerTitle: stationTitleMap[station],
    headerSubtitle: "Selamat bekerja di station kamu.",
    clockOutLabel: "Check Out",
    statsLabels: {
      incoming: "Incoming",
      inProgress: "In Progress",
      completed: "Completed",
    },
    listsLabels: {
      myTasksTitle: "My Tasks - Station",
      incomingTitle: "Incoming Orders",
      viewAll: "View all",
      emptyMyTasks: "Belum ada task.",
      emptyIncoming: "Belum ada incoming order.",
    },
  };
}

export function mergeDashboardCopy(
  station: StationType,
  copy?: Partial<WorkerDashboardCopy>,
): WorkerDashboardCopy {
  const defaultCopy = getDefaultCopy(station);

  return {
    ...defaultCopy,
    ...copy,
    statsLabels: { ...defaultCopy.statsLabels, ...(copy?.statsLabels ?? {}) },
    listsLabels: { ...defaultCopy.listsLabels, ...(copy?.listsLabels ?? {}) },
  };
}
