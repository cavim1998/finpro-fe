"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useClockOutMutation } from "@/hooks/api/useAttendanceMutations";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { useProfileQuery } from "@/hooks/api/useProfile";
import { useDriverDashboard } from "@/features/driver/useDriverDashboard";

import DriverHeader from "./DriverHeader";
import DriverLists from "./DriverLists";
import DriverStats from "./DriverStats";

function isActiveTask(task: unknown) {
  if (typeof task !== "object" || task === null) return false;
  const status = String((task as { status?: unknown }).status ?? "").toUpperCase();
  return status === "ASSIGNED" || status === "IN_PROGRESS";
}

function formatTime(d?: Date | string | null) {
  if (!d) return "-";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function DriverDashboard() {
  const profileQ = useProfileQuery();
  const attendanceQ = useAttendanceTodayQuery();
  const clockOutM = useClockOutMutation();

  const pageSize = 5;
  const [taskPage, setTaskPage] = useState(1);
  const [pickupPage, setPickupPage] = useState(1);

  const dashboardQ = useDriverDashboard({ pageSize, taskPage, pickupPage });

  const today = attendanceQ.data;
  const isCheckedIn = !!today?.isCheckedIn;
  const isCompleted = !!today?.isCompleted;

  const displayName =
    profileQ.data?.fullName ||
    profileQ.data?.name ||
    profileQ.data?.email ||
    "Driver";

  const role = (profileQ.data?.role ?? "DRIVER");

  const sinceText = formatTime(today?.log?.clockInAt ?? null);

  const isAllowed = isCheckedIn && !isCompleted;

  const onClockOut = async () => {
    await clockOutM.mutateAsync();
    await attendanceQ.refetch();
    await dashboardQ.refetch();
  };

  const stats = dashboardQ.data?.stats ?? {
    incoming: 0,
    inProgress: 0,
    completed: 0,
  };

  const tasks = (dashboardQ.data?.tasks?.items ?? []).filter(isActiveTask);
  const pickupRequests = dashboardQ.data?.pickupRequests?.items ?? [];
  const taskTotalPages = Number(dashboardQ.data?.tasks?.totalPages ?? 0);
  const pickupTotalPages = Number(dashboardQ.data?.pickupRequests?.totalPages ?? 0);

  const taskHasNextPage =
    (taskTotalPages > 0 && taskPage < taskTotalPages) || tasks.length === pageSize;
  const pickupHasNextPage =
    (pickupTotalPages > 0 && pickupPage < pickupTotalPages) || pickupRequests.length === pageSize;
  const hasActiveTask = tasks.length > 0 || Number(stats.inProgress) > 0;

  return (
    <div className="container mx-auto space-y-6 pb-24">
      <DriverHeader
        displayName={displayName}
        loadingToday={attendanceQ.isLoading}
        isCheckedIn={isCheckedIn}
        isCompleted={isCompleted}
        sinceText={sinceText}
        onClockOut={onClockOut}
        clockOutLoading={clockOutM.isPending}
      />

      <div className="p-1 space-y-5 -mt-4 pr-4 pl-4">
        <DriverStats
          incoming={dashboardQ.isFetching ? 0 : stats.incoming}
          inProgress={dashboardQ.isFetching ? 0 : stats.inProgress}
          completed={dashboardQ.isFetching ? 0 : stats.completed}
        />

        <DriverLists
          isAllowed={isAllowed}
          myTasks={tasks}
          pickupRequests={pickupRequests}
          hasActiveTask={hasActiveTask}
          dashboardParams={{ pageSize, taskPage, pickupPage }}
          onTaskPrev={() => setTaskPage((p) => Math.max(1, p - 1))}
          onTaskNext={() => setTaskPage((p) => p + 1)}
          onPickupPrev={() => setPickupPage((p) => Math.max(1, p - 1))}
          onPickupNext={() => setPickupPage((p) => p + 1)}
          taskHasNextPage={taskHasNextPage}
          pickupHasNextPage={pickupHasNextPage}
          dashboardLoading={dashboardQ.isFetching}
          dashboardError={dashboardQ.isError}
        />
      </div>

      <BottomNav role={role} />
    </div>
  );
}
