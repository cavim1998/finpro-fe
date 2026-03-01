"use client";

import WorkerStationOrderDetailPage from "@/components/worker/WorkerStationOrderDetailPage";

export default function WorkerPackingOrderDetailRoute() {
  return (
    <WorkerStationOrderDetailPage
      station="PACKING"
      stationPath="/worker/packing"
    />
  );
}
