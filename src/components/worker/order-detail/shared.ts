"use client";

export type ItemCounter = {
  itemId: number;
  name: string;
  expectedQty: number;
  actualQty: number;
};

export function formatDateTime(iso?: string) {
  if (!iso) return "-";

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

export function formatStatus(status?: string) {
  if (!status) return "-";

  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
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
