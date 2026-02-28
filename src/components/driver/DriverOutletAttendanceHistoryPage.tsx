"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import NavbarWorker from "@/components/Navbarworker";
import AttendanceHistoryPanel from "@/components/attendance/AttendanceHistoryPanel";
import RequireRole from "@/components/guards/RequireRole";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";

export default function DriverOutletAttendanceHistoryPage() {
  const params = useParams<{ outletStaffId: string }>();
  const router = useRouter();
  const attendanceTodayQ = useAttendanceTodayQuery();

  const routeOutletStaffId = Number(params?.outletStaffId ?? 0);
  const ownOutletStaffId = Number(attendanceTodayQ.data?.outletStaffId ?? 0);

  useEffect(() => {
    if (!Number.isFinite(ownOutletStaffId) || ownOutletStaffId <= 0) return;
    if (routeOutletStaffId === ownOutletStaffId) return;

    router.replace(`/driver/attendance-history/${ownOutletStaffId}`);
  }, [ownOutletStaffId, routeOutletStaffId, router]);

  return (
    <RequireRole roles={["DRIVER"]} redirectTo="/driver">
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="border-b-1">
          <NavbarWorker />
        </div>

        <div className="container mx-auto px-4 py-6 pb-24">
          <AttendanceHistoryPanel />
        </div>

        <BottomNav role="DRIVER" />
      </div>
    </RequireRole>
  );
}
