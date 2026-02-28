"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import WorkerCompletedOrders from "@/components/worker/WorkerCompletedOrders";
import { useProfileQuery } from "@/hooks/api/useProfile";

function getOutletId(profile: unknown): number | null {
  const data = (profile ?? {}) as {
    outletId?: number | string | null;
    outletStaff?: { outletId?: number | string | null };
    staff?: { outletId?: number | string | null };
  };

  const value =
    data.outletId ??
    data.outletStaff?.outletId ??
    data.staff?.outletId ??
    null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

type Props = {
  stationPath: "/worker/washing" | "/worker/ironing" | "/worker/packing";
  title: string;
  subtitle: string;
};

export default function WorkerStationOrdersPage({
  stationPath,
  station,
  title,
  subtitle,
}: Props & { station: "WASHING" | "IRONING" | "PACKING" }) {
  const params = useParams<{ outletId: string }>();
  const router = useRouter();
  const profileQ = useProfileQuery();

  const routeOutletId = Number(params?.outletId ?? 0);
  const ownOutletId = getOutletId(profileQ.data);
  const effectiveOutletId =
    ownOutletId || (Number.isFinite(routeOutletId) && routeOutletId > 0 ? routeOutletId : 0);

  useEffect(() => {
    if (!ownOutletId) return;
    if (routeOutletId === ownOutletId) return;

    router.replace(`${stationPath}/orders/${ownOutletId}`);
  }, [ownOutletId, routeOutletId, router, stationPath]);

  return (
    <RequireCheckInRQ roles={["WORKER"]} redirectTo={`/attendance?next=${stationPath}/orders`}>
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="border-b-1">
          <NavbarWorker />
        </div>
        {effectiveOutletId > 0 ? (
          <WorkerCompletedOrders
            station={station}
            outletId={effectiveOutletId}
            scope="incoming"
            title={title}
            subtitle={subtitle}
          />
        ) : null}
        <BottomNav role="WORKER" workerHomePath={stationPath} />
      </div>
    </RequireCheckInRQ>
  );
}
