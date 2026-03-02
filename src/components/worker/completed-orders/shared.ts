"use client";

import type { StationType } from "@/types";

export type WorkerCompletedOrdersTheme = ReturnType<typeof getStationTheme>;

export function formatEnteredAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isInDateRange(iso: string, startDate?: string, endDate?: string) {
  const value = formatDateInput(iso);
  if (!value) return false;
  if (startDate && value < startDate) return false;
  if (endDate && value > endDate) return false;
  return true;
}

export function getStationTheme(station: StationType) {
  if (station === "WASHING") {
    return {
      textClass: "text-blue-500",
      borderClass: "border-blue-200",
      hoverShadowClass: "hover:shadow-[0_16px_36px_rgba(59,130,246,0.14)]",
      softBgClass: "bg-blue-50/70",
      solidButtonClass: "bg-blue-50 text-blue-700 hover:bg-blue-100",
      ghostButtonClass: "border-blue-200 text-blue-600 hover:bg-blue-50",
    };
  }

  if (station === "IRONING") {
    return {
      textClass: "text-red-500",
      borderClass: "border-red-200",
      hoverShadowClass: "hover:shadow-[0_16px_36px_rgba(239,68,68,0.14)]",
      softBgClass: "bg-red-50/70",
      solidButtonClass: "bg-red-50 text-red-700 hover:bg-red-100",
      ghostButtonClass: "border-red-200 text-red-600 hover:bg-red-50",
    };
  }

  return {
    textClass: "text-[#1DACBC]",
    borderClass: "border-[#1DACBC]/30",
    hoverShadowClass: "hover:shadow-[0_16px_36px_rgba(29,172,188,0.14)]",
    softBgClass: "bg-[#1DACBC]/5",
    solidButtonClass: "bg-[#1DACBC]/10 text-[#138A96] hover:bg-[#1DACBC]/15",
    ghostButtonClass: "border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5",
  };
}

function formatDateInput(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
