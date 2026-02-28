"use client";

import WorkerStationDashboardPage from "@/components/worker/WorkerStationDashboardPage";

export default function WorkerPackingHomeByOutletStaffPage() {
  return (
    <WorkerStationDashboardPage
      station="PACKING"
      stationPath="/worker/packing"
      theme={{
        headerBgClass:
          "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-500/20 via-cyan-500/10 to-transparent",
        badgeClass: "text-sky-600",
      }}
      copy={{
        headerTitle: "Packing Station",
        headerSubtitle: "Fokus packing & pengemasan order hari ini.",
        clockOutLabel: "Check Out",
        statsLabels: {
          incoming: "Incoming",
          inProgress: "Processing",
          completed: "Done",
        },
        listsLabels: {
          myTasksTitle: "My Tasks - Packing",
          incomingTitle: "Incoming to Packing",
          viewAll: "View all",
          emptyMyTasks: "Belum ada task.",
          emptyIncoming: "Belum ada order masuk.",
        },
      }}
    />
  );
}
