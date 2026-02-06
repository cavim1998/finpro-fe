"use client";

import RequireCheckIn from "@/components/guards/RequireCheckIn";
import { WorkerDashboard } from "@/components/worker/WorkerDashboard";

export default function WorkerPage() {
  return (
    <RequireCheckIn roles={["WORKER"]} redirectTo="/attendance?next=/worker">
      <WorkerDashboard />
    </RequireCheckIn>
  );
}