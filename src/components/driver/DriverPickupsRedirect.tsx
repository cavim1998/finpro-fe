"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";

export default function DriverPickupsRedirect() {
  const router = useRouter();
  const attendanceTodayQ = useAttendanceTodayQuery();

  useEffect(() => {
    const outletId = Number(attendanceTodayQ.data?.outletId ?? 0);
    if (!Number.isFinite(outletId) || outletId <= 0) return;

    router.replace(`/driver/pickups/${outletId}`);
  }, [attendanceTodayQ.data?.outletId, router]);

  return null;
}
