"use client";

import WorkerStationDashboardPage from "@/components/worker/WorkerStationDashboardPage";

export default function WorkerWashingHomeByOutletStaffPage() {
  return (
    <WorkerStationDashboardPage
      station="WASHING"
      stationPath="/worker/washing"
      theme={{
        headerBgClass:
          "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-500/20 via-cyan-500/10 to-transparent",
        badgeClass: "text-sky-600",
      }}
      copy={{
        headerTitle: "Washing Station",
        headerSubtitle: "Fokus cuci & sortir order hari ini.",
        clockOutLabel: "Check Out",
        statsLabels: {
          incoming: "Incoming",
          inProgress: "Processing",
          completed: "Done",
        },
        listsLabels: {
          myTasksTitle: "My Tasks - Washing",
          incomingTitle: "Incoming to Washing",
          viewAll: "View all",
          emptyMyTasks: "Belum ada task.",
          emptyIncoming: "Belum ada order masuk.",
        },
      }}
    />
  );
}
