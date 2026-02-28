"use client";

import WorkerStationOrdersPage from "@/components/worker/WorkerStationOrdersPage";

export default function WorkerIroningOrdersByOutletStaffPage() {
  return (
    <WorkerStationOrdersPage
      station="IRONING"
      stationPath="/worker/ironing"
      title="Incoming Orders / Ironing"
      subtitle="Semua incoming order untuk outlet ini di Ironing."
    />
  );
}
