"use client";

import WorkerStationOrderDetailPage from "@/components/worker/WorkerStationOrderDetailPage";

export default function WorkerIroningHistoryOrderDetailRoute() {
  return (
    <WorkerStationOrderDetailPage
      station="IRONING"
      stationPath="/worker/ironing"
      historyMode
    />
  );
}
