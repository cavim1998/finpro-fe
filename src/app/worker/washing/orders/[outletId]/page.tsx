"use client";

import WorkerStationOrdersPage from "@/components/worker/WorkerStationOrdersPage";

export default function WorkerWashingOrdersByOutletStaffPage() {
  return (
    <WorkerStationOrdersPage
      station="WASHING"
      stationPath="/worker/washing"
      title="Incoming Orders / Washing"
      subtitle="Semua incoming order untuk outlet ini di Washing."
    />
  );
}
