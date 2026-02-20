"use client";

import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import WorkerDashboard from "@/components/worker/WorkerDashboard";

export default function WorkerIroningPage() {
  return (
    <RequireCheckInRQ
      roles={["WORKER"]}
      redirectTo="/attendance?next=/worker/ironing"
    >
      <div className="border-b-1">
        <NavbarWorker />
      </div>

      <WorkerDashboard
        station="IRONING"
        theme={{
          headerBgClass:
            "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-500/20 via-cyan-500/10 to-transparent",
          badgeClass: "text-sky-600",
        }}
        copy={{
          headerTitle: "Ironing Station",
          headerSubtitle: "Fokus setrika & penyelesaian order hari ini.",
          clockOutLabel: "Check Out",
          statsLabels: {
            incoming: "Incoming",
            inProgress: "Processing",
            completed: "Done",
          },
          listsLabels: {
            myTasksTitle: "My Tasks / Washing",
            incomingTitle: "Incoming to Washing",
            viewAll: "View all",
            emptyMyTasks: "Belum ada task.",
            emptyIncoming: "Belum ada order masuk.",
          },
        }}
      />
    </RequireCheckInRQ>
  );
}