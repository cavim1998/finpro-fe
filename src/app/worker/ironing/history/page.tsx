"use client";

import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import { BottomNav } from "@/components/BottomNav";
import WorkerCompletedOrders from "@/components/worker/WorkerCompletedOrders";

export default function WorkerIroningHistoryPage() {
  return (
    <RequireCheckInRQ roles={["WORKER"]} redirectTo="/attendance?next=/worker/ironing/history">
      <NavbarWorker />

      <WorkerCompletedOrders
        station="IRONING"
        title="History Orders / Ironing"
        subtitle="Riwayat order yang pernah kamu kerjakan di Ironing."
      />

      <BottomNav role="WORKER" workerHomePath="/worker/ironing" />
    </RequireCheckInRQ>
  );
}

