"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import WorkerDashboard, {
  type WorkerDashboardCopy,
  type WorkerDashboardTheme,
} from "@/components/worker/WorkerDashboard";
import type { StationType } from "@/types";

type Props = {
  station: StationType;
  stationPath: "/worker/washing" | "/worker/ironing" | "/worker/packing";
  copy?: Partial<WorkerDashboardCopy>;
  theme?: WorkerDashboardTheme;
};

export default function WorkerStationDashboardPage({
  station,
  stationPath,
  copy,
  theme,
}: Props) {
  const params = useParams<{ outletStaffId: string }>();
  const router = useRouter();
  const attendanceTodayQ = useAttendanceTodayQuery();

  const routeOutletStaffId = Number(params?.outletStaffId ?? 0);
  const ownOutletStaffId = Number(attendanceTodayQ.data?.outletStaffId ?? 0);

  useEffect(() => {
    if (!Number.isFinite(ownOutletStaffId) || ownOutletStaffId <= 0) return;
    if (routeOutletStaffId === ownOutletStaffId) return;

    router.replace(`${stationPath}/${ownOutletStaffId}`);
  }, [ownOutletStaffId, routeOutletStaffId, router, stationPath]);

  return (
    <RequireCheckInRQ
      roles={["WORKER"]}
      redirectTo={`/attendance?next=${stationPath}`}
    >
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="border-b-1">
          <NavbarWorker />
        </div>

        <WorkerDashboard station={station} theme={theme} copy={copy} />
      </div>
    </RequireCheckInRQ>
  );
}
