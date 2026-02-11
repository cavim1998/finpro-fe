"use client";

import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import { WorkerStationOrders } from "@/components/worker/WorkerStationOrders";
import type { StationType } from "@/types";

export default function WorkerWashingOrderPage() {
  const stationType: StationType = "WASHING";

  return (
    <RequireCheckInRQ
      roles={["WORKER"]}
      redirectTo="/attendance?next=/worker/washing/order"
    >
      <div className="border-b-1">
        <NavbarWorker />
      </div>

      <WorkerStationOrders
        stationType={stationType}
        basePath="/worker/washing"
        header={{
          title: "Washing Orders",
          subtitle: "Kelola order untuk Washing Station",
        }}
        listsLabels={{
          myTasksTitle: "My Tasks / Washing",
          incomingTitle: "Incoming to Washing",
          viewAll: "View all",
          emptyMyTasks: "Belum ada task washing.",
          emptyIncoming: "Belum ada order masuk ke washing.",
        }}
      />
    </RequireCheckInRQ>
  );
}