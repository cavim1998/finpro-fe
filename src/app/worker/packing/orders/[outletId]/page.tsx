"use client";

import WorkerStationOrdersPage from "@/components/worker/WorkerStationOrdersPage";

export default function WorkerPackingOrdersByOutletStaffPage() {
  return (
    <WorkerStationOrdersPage
      station="PACKING"
      stationPath="/worker/packing"
      title="Incoming Orders / Packing"
      subtitle="Semua incoming order untuk outlet ini di Packing."
    />
  );
}
