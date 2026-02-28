"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import DriverDashboard from "@/app/driver/components/DriverDasboard";

export default function DriverDashboardHomePage() {
  const params = useParams<{ outletStaffId: string }>();
  const router = useRouter();
  const attendanceTodayQ = useAttendanceTodayQuery();

  const routeOutletStaffId = Number(params?.outletStaffId ?? 0);
  const ownOutletStaffId = Number(attendanceTodayQ.data?.outletStaffId ?? 0);

  useEffect(() => {
    if (!Number.isFinite(ownOutletStaffId) || ownOutletStaffId <= 0) return;
    if (routeOutletStaffId === ownOutletStaffId) return;

    router.replace(`/driver/${ownOutletStaffId}`);
  }, [ownOutletStaffId, routeOutletStaffId, router]);

  return (
    <RequireCheckInRQ roles={["DRIVER"]} redirectTo="/attendance?next=/driver">
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="border-b-1">
          <NavbarWorker />
        </div>
        <DriverDashboard />
      </div>
    </RequireCheckInRQ>
  );
}
