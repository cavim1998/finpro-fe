"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";

type Props = {
  station: "washing" | "ironing" | "packing";
};

export default function WorkerAttendanceHistoryRedirect({ station }: Props) {
  const router = useRouter();
  const attendanceTodayQ = useAttendanceTodayQuery();

  useEffect(() => {
    const outletStaffId = Number(attendanceTodayQ.data?.outletStaffId ?? 0);
    if (!Number.isFinite(outletStaffId) || outletStaffId <= 0) return;

    router.replace(`/worker/${station}/attendance-history/${outletStaffId}`);
  }, [attendanceTodayQ.data?.outletStaffId, router, station]);

  return null;
}
