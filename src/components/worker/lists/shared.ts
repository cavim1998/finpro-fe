"use client";

import type { StationType } from "@/types";

export type WorkerListsLabels = {
  myTasksTitle: string;
  incomingTitle: string;
  viewAll: string;
  emptyMyTasks: string;
  emptyIncoming: string;
};

export function formatEnteredAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function resolveWorkerListsLabels(
  labels?: Partial<WorkerListsLabels>,
): WorkerListsLabels {
  return {
    myTasksTitle: labels?.myTasksTitle ?? "My Tasks / Station",
    incomingTitle: labels?.incomingTitle ?? "Incoming Orders",
    viewAll: labels?.viewAll ?? "View all",
    emptyMyTasks: labels?.emptyMyTasks ?? "Belum ada task.",
    emptyIncoming: labels?.emptyIncoming ?? "Belum ada incoming order.",
  };
}

export function getStationListTheme(station: StationType) {
  if (station === "WASHING") {
    return {
      accentClass: "text-blue-500",
      containerClass:
        "border-blue-200 hover:border-blue-500 hover:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]",
      itemHoverClass: "hover:shadow-[0_0_0_3px_rgba(59,130,246,0.10)]",
    };
  }

  if (station === "IRONING") {
    return {
      accentClass: "text-red-500",
      containerClass:
        "border-red-200 hover:border-red-500 hover:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]",
      itemHoverClass: "hover:shadow-[0_0_0_3px_rgba(239,68,68,0.10)]",
    };
  }

  return {
    accentClass: "text-[#1dacbc]",
    containerClass:
      "border-cyan-200 hover:border-[#1dacbc] hover:shadow-[0_0_0_3px_rgba(29,172,188,0.12)]",
    itemHoverClass: "hover:shadow-[0_0_0_3px_rgba(29,172,188,0.10)]",
  };
}

export function getIncomingListTheme() {
  return {
    accentClass: "text-[#1dacbc]",
    containerClass:
      "border-cyan-200 hover:border-[#1dacbc] hover:shadow-[0_0_0_3px_rgba(29,172,188,0.12)]",
    itemHoverClass: "hover:shadow-[0_0_0_3px_rgba(29,172,188,0.10)]",
  };
}
