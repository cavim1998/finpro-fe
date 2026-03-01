"use client";

import WorkerStationOrderDetailPage from "@/components/worker/WorkerStationOrderDetailPage";

export default function WorkerPackingHistoryOrderDetailRoute() {
  return (
    <WorkerStationOrderDetailPage
      station="PACKING"
      stationPath="/worker/packing"
      historyMode
    />
  );
}
