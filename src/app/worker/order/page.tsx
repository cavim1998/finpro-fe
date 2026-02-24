"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProfileQuery } from "@/hooks/api/useProfile";

function normalizeStation(raw?: unknown): "washing" | "ironing" | "packing" {
  const value = String(raw ?? "").toUpperCase();
  if (value.includes("IRONING")) return "ironing";
  if (value.includes("PACKING")) return "packing";
  return "washing";
}

export default function WorkerOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileQ = useProfileQuery();

  useEffect(() => {
    const station = normalizeStation(
      searchParams.get("stationType") ||
        profileQ.data?.station ||
        profileQ.data?.workerStation ||
        profileQ.data?.outletStaff?.workerStation ||
        profileQ.data?.staff?.workerStation,
    );
    const orderId = searchParams.get("orderId");

    if (orderId) {
      router.replace(`/worker/${station}/order/${encodeURIComponent(orderId)}`);
      return;
    }

    router.replace(`/worker/${station}/orders`);
  }, [profileQ.data, router, searchParams]);

  return null;
}
