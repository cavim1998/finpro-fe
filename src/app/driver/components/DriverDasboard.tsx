"use client";

import { BottomNav } from "@/components/BottomNav";
import { useClockOutMutation } from "@/hooks/api/useAttendanceMutations";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { useProfileQuery } from "@/hooks/api/useProfile";
import { useDriverDashboard } from "@/features/driver/useDriverDashboard";

import DriverHeader from "./DriverHeader";
import DriverLists from "./DriverLists";

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

  // pagination backend dashboard
  const pageSize = 5;
  const taskPage = 1;
  const pickupPage = 1;

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

  const tasks = dashboardQ.data?.tasks?.items ?? [];
  const pickupRequests = dashboardQ.data?.pickupRequests?.items ?? [];

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
        stats={stats}
        dashboardLoading={dashboardQ.isLoading}
      />

      <div className="p-1 space-y-5 -mt-4 pr-4 pl-4">
        <DriverLists
          isAllowed={isAllowed}
          myTasks={tasks}
          pickupRequests={pickupRequests}
          dashboardLoading={dashboardQ.isLoading}
          dashboardError={dashboardQ.isError}
        />
      </div>

      <BottomNav role={role} />
    </div>
  );
}