"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import NavbarWorker from "@/components/Navbarworker";
import AttendanceHistoryPanel from "@/components/attendance/AttendanceHistoryPanel";
import RequireRole from "@/components/guards/RequireRole";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";

type Props = {
  stationPath: "/worker/washing" | "/worker/ironing" | "/worker/packing";
};

export default function WorkerStationAttendanceHistoryPage({ stationPath }: Props) {
  const params = useParams<{ outletStaffId: string }>();
  const router = useRouter();
  const attendanceTodayQ = useAttendanceTodayQuery();

  const routeOutletStaffId = Number(params?.outletStaffId ?? 0);
  const ownOutletStaffId = Number(attendanceTodayQ.data?.outletStaffId ?? 0);
  const effectiveOutletStaffId =
    (Number.isFinite(ownOutletStaffId) && ownOutletStaffId > 0 ? ownOutletStaffId : 0) ||
    (Number.isFinite(routeOutletStaffId) && routeOutletStaffId > 0 ? routeOutletStaffId : 0);

  useEffect(() => {
    if (!Number.isFinite(ownOutletStaffId) || ownOutletStaffId <= 0) return;
    if (routeOutletStaffId === ownOutletStaffId) return;

    router.replace(`${stationPath}/attendance-history/${ownOutletStaffId}`);
  }, [ownOutletStaffId, routeOutletStaffId, router, stationPath]);

  return (
    <RequireRole roles={["WORKER"]} redirectTo={stationPath}>
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="border-b-1">
          <NavbarWorker />
        </div>

        {effectiveOutletStaffId > 0 ? (
          <div className="container mx-auto px-4 py-6 pb-24">
            <AttendanceHistoryPanel />
          </div>
        ) : null}

        <BottomNav role="WORKER" workerHomePath={stationPath} />
      </div>
    </RequireRole>
  );
}
