"use client";

import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import { BottomNav } from "@/components/BottomNav";
import WorkerCompletedOrders from "@/components/worker/WorkerCompletedOrders";

export default function WorkerPackingOrdersPage() {
  return (
    <RequireCheckInRQ
      roles={["WORKER"]}
      redirectTo="/attendance?next=/worker/packing/order"
    >
      <NavbarWorker />

      <WorkerCompletedOrders
        station="PACKING"
        title="Completed Orders / Packing"
        subtitle="Semua order yang pernah kamu selesaikan di Packing."
      />
      <BottomNav role="WORKER" workerHomePath="/worker/packing" />
    </RequireCheckInRQ>
  );
}
