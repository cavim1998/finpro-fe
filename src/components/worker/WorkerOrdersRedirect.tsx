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

function getOutletId(profile: unknown): number | null {
  const data = (profile ?? {}) as {
    outletId?: number | string | null;
    outletStaff?: { outletId?: number | string | null };
    staff?: { outletId?: number | string | null };
  };

  const value =
    data.outletId ??
    data.outletStaff?.outletId ??
    data.staff?.outletId ??
    null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

type WorkerOrdersRedirectProps = {
  station?: "washing" | "ironing" | "packing";
};

export default function WorkerOrdersRedirect({ station }: WorkerOrdersRedirectProps) {
  const router = useRouter();
  const profileQ = useProfileQuery();

  useEffect(() => {
    const outletId = getOutletId(profileQ.data);
    if (!outletId) return;

    const resolvedStation =
      station ??
      normalizeStation(
        profileQ.data?.station ||
          profileQ.data?.workerStation ||
          profileQ.data?.outletStaff?.workerStation ||
          profileQ.data?.staff?.workerStation,
      );

    router.replace(`/worker/${resolvedStation}/orders/${outletId}`);
  }, [profileQ.data, router, station]);

  return null;
}
