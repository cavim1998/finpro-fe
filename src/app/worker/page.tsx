"use client";

import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import { WorkerDashboard } from "@/components/worker/WorkerDashboard";
import { RoleCode } from "@/types";

export default function WorkerPage() {
  return (
    <RequireCheckInRQ
      roles={["WORKER" as RoleCode]}
      redirectTo="/attendance?next=/worker"
    >
      <WorkerDashboard />
    </RequireCheckInRQ>
  );
}