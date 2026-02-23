"use client";

import { BottomNav } from "@/components/BottomNav";
import NavbarWorker from "@/components/Navbarworker";
import AttendanceHistoryPanel from "@/components/attendance/AttendanceHistoryPanel";
import RequireRole from "@/components/guards/RequireRole";

export default function WorkerWashingAttendanceHistoryPage() {
  return (
    <RequireRole roles={["WORKER"]} redirectTo="/worker/washing">
      <NavbarWorker />

      <div className="container mx-auto px-4 py-6 pb-24">
        <AttendanceHistoryPanel />
      </div>

      <BottomNav role="WORKER" workerHomePath="/worker/washing" />
    </RequireRole>
  );
}

