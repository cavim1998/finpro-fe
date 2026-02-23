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

export default function WorkerProcessOrderPage() {
  const router = useRouter();
  const profileQ = useProfileQuery();

  useEffect(() => {
    const station = normalizeStation(
      profileQ.data?.station ||
        profileQ.data?.workerStation ||
        profileQ.data?.outletStaff?.workerStation ||
        profileQ.data?.staff?.workerStation,
    );
    router.replace(`/worker/${station}`);
  }, [profileQ.data, router]);

  return null;
}
