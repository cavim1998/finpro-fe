"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProfileQuery } from "@/hooks/api/useProfile";

function normalizeStation(raw?: unknown): "washing" | "ironing" | "packing" {
  const value = String(raw ?? "").toUpperCase();
  if (value.includes("IRONING")) return "ironing";
  if (value.includes("PACKING")) return "packing";
  return "washing";
}

function getOutletStaffId(profile: unknown): number | null {
  const data = (profile ?? {}) as {
    outletStaffId?: number | string | null;
    outletStaff?: { id?: number | string | null };
    staff?: { id?: number | string | null };
  };

  const value =
    data.outletStaffId ??
    data.outletStaff?.id ??
    data.staff?.id ??
    null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export default function WorkerHistoryByOutletStaffPage() {
  const params = useParams<{ outletStaffId: string }>();
  const router = useRouter();
  const profileQ = useProfileQuery();

  const routeOutletStaffId = Number(params?.outletStaffId ?? 0);
  const ownOutletStaffId = getOutletStaffId(profileQ.data);
  const effectiveOutletStaffId = ownOutletStaffId || routeOutletStaffId;
  const station = normalizeStation(
    profileQ.data?.station ||
      profileQ.data?.workerStation ||
      profileQ.data?.outletStaff?.workerStation ||
      profileQ.data?.staff?.workerStation,
  );

  useEffect(() => {
    if (!effectiveOutletStaffId) return;

    router.replace(`/worker/${station}/history/${effectiveOutletStaffId}`);
  }, [effectiveOutletStaffId, router, station]);

  return null;
}
