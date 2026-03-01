"use client";

import WorkerStationOrderDetailPage from "@/components/worker/WorkerStationOrderDetailPage";

export default function WorkerWashingHistoryOrderDetailRoute() {
  return (
    <WorkerStationOrderDetailPage
      station="WASHING"
      stationPath="/worker/washing"
      historyMode
    />
  );
}
