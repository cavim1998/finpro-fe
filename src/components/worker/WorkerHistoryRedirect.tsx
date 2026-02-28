"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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

type WorkerHistoryRedirectProps = {
  station?: "washing" | "ironing" | "packing";
};

export default function WorkerHistoryRedirect({ station }: WorkerHistoryRedirectProps) {
  const router = useRouter();
  const profileQ = useProfileQuery();

  useEffect(() => {
    const outletStaffId = getOutletStaffId(profileQ.data);
    if (!outletStaffId) return;

    const resolvedStation =
      station ??
      normalizeStation(
        profileQ.data?.station ||
          profileQ.data?.workerStation ||
          profileQ.data?.outletStaff?.workerStation ||
          profileQ.data?.staff?.workerStation,
      );

    router.replace(`/worker/${resolvedStation}/history/${outletStaffId}`);
  }, [profileQ.data, router, station]);

  return null;
}
