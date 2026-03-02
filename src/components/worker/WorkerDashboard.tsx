"use client";

import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useClockOutMutation } from "@/hooks/api/useAttendanceMutations";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { useProfileQuery } from "@/hooks/api/useProfile";
import {
  type WorkerOrderListItem,
  useWorkerStationOrdersQuery,
  useWorkerStationStatsQuery,
} from "@/hooks/api/useWorkerStations";
import { useRouter } from "next/navigation";
import type { StationType } from "@/types";
import WorkerHeader from "./WorkerHeader";
import WorkerLists from "./WorkerLists";
import WorkerStats from "./WorkerStats";
import WorkerDashboardNotificationContent from "./dashboard/WorkerDashboardNotificationContent";
import {
  formatTime,
  getOutletStaffId,
  mergeDashboardCopy,
  normalizeStation,
  type WorkerDashboardCopy,
  type WorkerDashboardTheme,
} from "./dashboard/shared";

type Props = {
  station: StationType;
  copy?: Partial<WorkerDashboardCopy>;
  theme?: WorkerDashboardTheme;
};

export default function WorkerDashboard({ station, copy, theme }: Props) {
  const router = useRouter();
  const profileQ = useProfileQuery();
  const attendanceQ = useAttendanceTodayQuery();
  const clockOutM = useClockOutMutation();
  const [notificationOpen, setNotificationOpen] = useState<boolean | null>(null);

  const today = attendanceQ.data;
  const isCheckedIn = !!today?.isCheckedIn;
  const isCompleted = !!today?.isCompleted;

  const displayName =
    profileQ.data?.fullName ||
    profileQ.data?.name ||
    profileQ.data?.email ||
    "Worker";
  const workerOutletStaffId = (() => {
    const fromAttendance = Number(today?.outletStaffId ?? 0);
    if (Number.isFinite(fromAttendance) && fromAttendance > 0) {
      return fromAttendance;
    }

    return getOutletStaffId(profileQ.data);
  })();
  const workerOutletId = Number(
    today?.outletId ??
      profileQ.data?.outletId ??
      profileQ.data?.outletStaff?.outletId ??
      profileQ.data?.staff?.outletId ??
      0,
  );

  const sinceText = formatTime(today?.log?.clockInAt ?? null);

  const isAllowed = isCheckedIn && !isCompleted;

  const workerStation =
    normalizeStation(profileQ.data?.station) ||
    normalizeStation(profileQ.data?.workerStation) ||
    normalizeStation(profileQ.data?.outletStaff?.workerStation) ||
    normalizeStation(profileQ.data?.staff?.workerStation);

  const expectedWorkerPath = workerStation
    ? `/worker/${workerStation.toLowerCase()}`
    : null;

  const shouldRedirectToOwnStation = !!expectedWorkerPath && workerStation !== station;

  // Worker should only access their own station dashboard.
  useEffect(() => {
    if (shouldRedirectToOwnStation && expectedWorkerPath) {
      router.replace(expectedWorkerPath);
    }
  }, [shouldRedirectToOwnStation, expectedWorkerPath, router]);

  const statsQ = useWorkerStationStatsQuery(station, { enabled: isAllowed });
  const incomingQ = useWorkerStationOrdersQuery(station, "incoming", {
    enabled: isAllowed,
    outletId: workerOutletId,
    page: 1,
    limit: 5,
  });
  const myTasksQ = useWorkerStationOrdersQuery(station, "my", {
    enabled: isAllowed,
    outletId: workerOutletId,
    page: 1,
    limit: 1,
  });

  const incoming = statsQ.data?.incoming ?? 0;
  const inProgress = statsQ.data?.inProgress ?? 0;
  const completed = statsQ.data?.completed ?? 0;
  const incomingItems = incomingQ.data ?? [];
  const currentTask = (myTasksQ.data?.[0] ?? null) as WorkerOrderListItem | null;

  const resolvedNotificationOpen =
    notificationOpen ?? (isAllowed && incomingItems.length > 0);

  const onClockOut = async () => {
    await clockOutM.mutateAsync();
    await attendanceQ.refetch();
  };
  const mergedCopy = mergeDashboardCopy(station, copy);

  const workerHomePath = `/worker/${station.toLowerCase()}`;

  if (shouldRedirectToOwnStation) return null;

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
        incomingCount={incoming}
        notificationOpen={resolvedNotificationOpen}
        onNotificationOpenChange={setNotificationOpen}
        notificationContent={
          <WorkerDashboardNotificationContent
            items={incomingItems}
            station={station}
            workerOutletId={workerOutletId}
            onClose={() => setNotificationOpen(false)}
            onNavigate={(href) => router.push(href)}
          />
        }
      />

      <div className="p-1 space-y-5 -mt-4 pr-4 pl-4">
        <WorkerStats
          station={station}
          incoming={incoming}
          inProgress={inProgress}
          completed={completed}
          onIncomingClick={() =>
            router.push(
              workerOutletId > 0
                ? `/worker/${station.toLowerCase()}/orders/${workerOutletId}`
                : `/worker/${station.toLowerCase()}/orders`,
            )
          }
          onInProgressClick={() => {
            if (!currentTask?.orderId) return;
            router.push(`/worker/${station.toLowerCase()}/order/${encodeURIComponent(currentTask.orderId)}`);
          }}
          onCompletedClick={() =>
            router.push(
              workerOutletStaffId
                ? `/worker/${station.toLowerCase()}/history/${workerOutletStaffId}`
                : `/worker/${station.toLowerCase()}/history`,
            )
          }
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
