"use client";

import WorkerStationOrderDetailPage from "@/components/worker/WorkerStationOrderDetailPage";

export default function WorkerWashingOrderDetailRoute() {
  return (
    <WorkerStationOrderDetailPage
      station="WASHING"
      stationPath="/worker/washing"
    />
  );
}
