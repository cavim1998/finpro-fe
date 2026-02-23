"use client";

import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import { BottomNav } from "@/components/BottomNav";
import WorkerCompletedOrders from "@/components/worker/WorkerCompletedOrders";

export default function WorkerIroningOrdersPage() {
  return (
    <RequireCheckInRQ
      roles={["WORKER"]}
      redirectTo="/attendance?next=/worker/ironing/order"
    >
      <NavbarWorker />

      <WorkerCompletedOrders
        station="IRONING"
        title="Completed Orders / Ironing"
        subtitle="Semua order yang pernah kamu selesaikan di Ironing."
      />
      <BottomNav role="WORKER" workerHomePath="/worker/ironing" />
    </RequireCheckInRQ>
  );
}
