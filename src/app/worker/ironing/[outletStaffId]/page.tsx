"use client";

import WorkerStationDashboardPage from "@/components/worker/WorkerStationDashboardPage";

export default function WorkerIroningHomeByOutletStaffPage() {
  return (
    <WorkerStationDashboardPage
      station="IRONING"
      stationPath="/worker/ironing"
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
          myTasksTitle: "My Tasks - Ironing",
          incomingTitle: "Incoming to Ironing",
          viewAll: "View all",
          emptyMyTasks: "Belum ada task.",
          emptyIncoming: "Belum ada order masuk.",
        },
      }}
    />
  );
}
