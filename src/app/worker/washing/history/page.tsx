"use client";

import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import { BottomNav } from "@/components/BottomNav";
import WorkerCompletedOrders from "@/components/worker/WorkerCompletedOrders";

export default function WorkerWashingHistoryPage() {
  return (
    <RequireCheckInRQ roles={["WORKER"]} redirectTo="/attendance?next=/worker/washing/history">
      <NavbarWorker />

      <WorkerCompletedOrders
        station="WASHING"
        title="History Orders / Washing"
        subtitle="Riwayat order yang pernah kamu kerjakan di Washing."
      />

      <BottomNav role="WORKER" workerHomePath="/worker/washing" />
    </RequireCheckInRQ>
  );
}

