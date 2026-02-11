"use client";

import { BottomNav } from "@/components/BottomNav";
import { useClockOutMutation } from "@/hooks/api/useAttendanceMutations";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { useProfileQuery } from "@/hooks/api/useProfile";
import { useWorkerStationStatsQuery } from "@/hooks/api/useWorkerStations";
import type { StationType } from "@/types";
import WorkerHeader, { type WorkerHeaderTheme } from "./WorkerHeader";
import WorkerLists from "./WorkerLists";
import WorkerStats from "./WorkerStats";

function formatTime(d?: Date | string | null) {
  if (!d) return "-";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

const stationTitleMap: Record<StationType, string> = {
  WASHING: "Washing Station",
  IRONING: "Ironing Station",
  PACKING: "Packing Station",
};

export type WorkerDashboardCopy = {
  headerTitle: string;
  headerSubtitle?: string;

  clockOutLabel: string;

  statsLabels: {
    incoming: string;
    inProgress: string;
    completed: string;
  };

  listsLabels: {
    myTasksTitle: string;
    incomingTitle: string;
    viewAll: string;
    emptyMyTasks: string;
    emptyIncoming: string;
  };
};

export type WorkerDashboardTheme = WorkerHeaderTheme;

type Props = {
  station: StationType;
  copy?: Partial<WorkerDashboardCopy>;
  theme?: WorkerDashboardTheme;
};

export default function WorkerDashboard({ station, copy, theme }: Props) {
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
    "Worker";

  const sinceText = formatTime(today?.log?.clockInAt ?? null);

  const isAllowed = isCheckedIn && !isCompleted;

  const statsQ = useWorkerStationStatsQuery(station, { enabled: isAllowed });

  const incoming = statsQ.data?.incoming ?? 0;
  const inProgress = statsQ.data?.inProgress ?? 0;
  const completed = statsQ.data?.completed ?? 0;

  const onClockOut = async () => {
    await clockOutM.mutateAsync();
    await attendanceQ.refetch();
  };

  const defaultCopy: WorkerDashboardCopy = {
    headerTitle: stationTitleMap[station],
    headerSubtitle: "Selamat bekerja di station kamu.",
    clockOutLabel: "Check Out",
    statsLabels: {
      incoming: "Incoming",
      inProgress: "In Progress",
      completed: "Completed",
    },
    listsLabels: {
      myTasksTitle: "My Tasks / Station",
      incomingTitle: "Incoming Orders",
      viewAll: "View all",
      emptyMyTasks: "Belum ada task.",
      emptyIncoming: "Belum ada incoming order.",
    },
  };

  const mergedCopy: WorkerDashboardCopy = {
    ...defaultCopy,
    ...copy,
    statsLabels: { ...defaultCopy.statsLabels, ...(copy?.statsLabels ?? {}) },
    listsLabels: { ...defaultCopy.listsLabels, ...(copy?.listsLabels ?? {}) },
  };

  const workerHomePath = `/worker/${station.toLowerCase()}`;

  return (
    <div className="container mx-auto space-y-6 pb-24">
      <WorkerHeader
        displayName={displayName}
        headerTitle={mergedCopy.headerTitle}
        headerSubtitle={mergedCopy.headerSubtitle}
        loadingToday={attendanceQ.isLoading}
        isCheckedIn={isCheckedIn}
        isCompleted={isCompleted}
        sinceText={sinceText}
        onClockOut={onClockOut}
        clockOutLoading={clockOutM.isPending}
        clockOutLabel={mergedCopy.clockOutLabel}
        theme={theme}
      />

      <div className="p-1 space-y-5 -mt-4 pr-4 pl-4">
        <WorkerStats
          incoming={incoming}
          inProgress={inProgress}
          completed={completed}
          labels={mergedCopy.statsLabels}
        />

        <WorkerLists
          station={station}
          isAllowed={isAllowed}
          labels={mergedCopy.listsLabels}
        />
      </div>

      <BottomNav role="WORKER" workerHomePath={workerHomePath} />
    </div>
  );
}
