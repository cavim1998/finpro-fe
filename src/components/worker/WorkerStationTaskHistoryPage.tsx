"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import WorkerTaskHistory from "@/components/worker/WorkerTaskHistory";
import { useProfileQuery } from "@/hooks/api/useProfile";

function getOutletStaffId(profile: unknown): number | null {
  const data = (profile ?? {}) as {
    outletStaffId?: number | string | null;
    outletStaff?: { id?: number | string | null };
    staff?: { id?: number | string | null };
  };

  const value =
    data.outletStaffId ??
    data.outletStaff?.id ??
    data.staff?.id ??
    null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

type Props = {
  stationPath: "/worker/washing" | "/worker/ironing" | "/worker/packing";
};

export default function WorkerStationTaskHistoryPage({ stationPath }: Props) {
  const params = useParams<{ outletStaffId: string }>();
  const router = useRouter();
  const profileQ = useProfileQuery();

  const routeOutletStaffId = Number(params?.outletStaffId ?? 0);
  const ownOutletStaffId = getOutletStaffId(profileQ.data);
  const effectiveOutletStaffId =
    ownOutletStaffId || (Number.isFinite(routeOutletStaffId) && routeOutletStaffId > 0 ? routeOutletStaffId : 0);

  useEffect(() => {
    if (!ownOutletStaffId) return;
    if (routeOutletStaffId === ownOutletStaffId) return;

    router.replace(`${stationPath}/history/${ownOutletStaffId}`);
  }, [ownOutletStaffId, routeOutletStaffId, router, stationPath]);

  return (
    <RequireCheckInRQ roles={["WORKER"]} redirectTo={`/attendance?next=${stationPath}/history`}>
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="border-b-1">
          <NavbarWorker />
        </div>
        {effectiveOutletStaffId > 0 ? (
          <WorkerTaskHistory
            outletStaffId={effectiveOutletStaffId}
            title="Task History"
            subtitle="Semua riwayat task yang pernah dikerjakan oleh worker ini."
          />
        ) : null}
        <BottomNav role="WORKER" workerHomePath={stationPath} />
      </div>
    </RequireCheckInRQ>
  );
}
