"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";

export default function DriverDashboardRedirect() {
  const router = useRouter();
  const attendanceTodayQ = useAttendanceTodayQuery();

  useEffect(() => {
    const outletStaffId = Number(attendanceTodayQ.data?.outletStaffId ?? 0);
    if (!Number.isFinite(outletStaffId) || outletStaffId <= 0) return;

    router.replace(`/driver/${outletStaffId}`);
  }, [attendanceTodayQ.data?.outletStaffId, router]);

  return null;
}
