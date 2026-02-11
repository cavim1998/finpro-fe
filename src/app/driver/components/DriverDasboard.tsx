"use client";

import { BottomNav } from "@/components/BottomNav";
import { useClockOutMutation } from "@/hooks/api/useAttendanceMutations";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { useProfileQuery } from "@/hooks/api/useProfile";
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

  const today = attendanceQ.data;
  const isCheckedIn = !!today?.isCheckedIn;
  const isCompleted = !!today?.isCompleted;

  const displayName =
    profileQ.data?.fullName ||
    profileQ.data?.name ||
    profileQ.data?.email ||
    "Driver";

  const sinceText = formatTime(today?.log?.clockInAt ?? null);
  const incoming = 0;
  const inProgress = 0;
  const completed = 0;

  const isAllowed = isCheckedIn && !isCompleted;

  const onClockOut = async () => {
    await clockOutM.mutateAsync();
    await attendanceQ.refetch();
  };

  return (
    <div className="container mx-auto space-y-6">
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
        <DriverLists isAllowed={isAllowed} />
      </div>

      <BottomNav />
    </div>
  );
}
