"use client";

import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import { BottomNav } from "@/components/BottomNav";
import WorkerCompletedOrders from "@/components/worker/WorkerCompletedOrders";

export default function WorkerPackingHistoryPage() {
  return (
    <RequireCheckInRQ roles={["WORKER"]} redirectTo="/attendance?next=/worker/packing/history">
      <NavbarWorker />

      <WorkerCompletedOrders
        station="PACKING"
        title="History Orders / Packing"
        subtitle="Riwayat order yang pernah kamu kerjakan di Packing."
      />

      <BottomNav role="WORKER" workerHomePath="/worker/packing" />
    </RequireCheckInRQ>
  );
}

