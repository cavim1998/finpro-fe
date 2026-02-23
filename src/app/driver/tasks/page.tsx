"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { useDriverDashboard } from "@/features/driver/useDriverDashboard";
import DriverTaskList from "@/app/driver/components/DriverTaskList";

export default function DriverTasksPage() {
  const pageSize = 10;
  const [taskPage, setTaskPage] = useState(1);
  const pickupPage = 1;

  const attendanceQ = useAttendanceTodayQuery();
  const isAllowed = !!attendanceQ.data?.isCheckedIn && !attendanceQ.data?.isCompleted;

  const dashboardQ = useDriverDashboard({ pageSize, taskPage, pickupPage });
  const tasks = dashboardQ.data?.tasks?.items ?? [];
  const totalPages = Number(dashboardQ.data?.tasks?.totalPages ?? 0);
  const hasNextPage = (totalPages > 0 && taskPage < totalPages) || tasks.length === pageSize;

  return (
    <RequireCheckInRQ roles={["DRIVER"]} redirectTo="/attendance?next=/driver/tasks">
      <NavbarWorker />

      <div className="container mx-auto px-4 py-6 pb-24">
        <DriverTaskList
          title="All Driver Tasks"
          isAllowed={isAllowed}
          myTasks={tasks}
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
