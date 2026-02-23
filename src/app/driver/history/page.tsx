"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { useDriverDashboard } from "@/features/driver/useDriverDashboard";
import DriverTaskList from "@/app/driver/components/DriverTaskList";

function isCompletedTask(task: unknown) {
  if (typeof task !== "object" || task === null) return false;
  const status = String((task as { status?: unknown }).status ?? "").toUpperCase();
  return status === "DONE" || status === "COMPLETED";
}

export default function DriverHistoryPage() {
  const pageSize = 10;
  const [taskPage, setTaskPage] = useState(1);
  const pickupPage = 1;

  const attendanceQ = useAttendanceTodayQuery();
  const isAllowed = !!attendanceQ.data?.isCheckedIn && !attendanceQ.data?.isCompleted;

  const dashboardQ = useDriverDashboard({ pageSize, taskPage, pickupPage });
  const allTasks = dashboardQ.data?.tasks?.items ?? [];
  const completedTasks = allTasks.filter(isCompletedTask);
  const totalPages = Number(dashboardQ.data?.tasks?.totalPages ?? 0);
  const hasNextPage = (totalPages > 0 && taskPage < totalPages) || allTasks.length === pageSize;

  return (
    <RequireCheckInRQ roles={["DRIVER"]} redirectTo="/attendance?next=/driver/history">
      <NavbarWorker />

      <div className="container mx-auto px-4 py-6 pb-24">
        <DriverTaskList
          title="Completed Driver Tasks"
          isAllowed={isAllowed}
          myTasks={completedTasks}
          page={taskPage}
          hasNextPage={hasNextPage}
          loading={dashboardQ.isFetching}
          onPrev={() => setTaskPage((p) => Math.max(1, p - 1))}
          onNext={() => setTaskPage((p) => p + 1)}
          showViewAll={false}
        />
      </div>

      <BottomNav role="DRIVER" />
    </RequireCheckInRQ>
  );
}
