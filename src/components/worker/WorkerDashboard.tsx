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
import { Button } from "@/components/ui/button";
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

function getOutletStaffId(profile: unknown): number | null {
  const data = (profile ?? {}) as {
    outletStaffId?: number | string | null;
    outletStaff?: { id?: number | string | null };
    staff?: { id?: number | string | null };
  };

  const value =
    data.outletStaffId ??
    data.outletStaff?.id ??
    data.staff?.id ??
    null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

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

  const normalizeStation = (raw?: unknown): StationType | null => {
    if (!raw) return null;
    const value = String(raw).toUpperCase();
    if (value.includes("WASHING")) return "WASHING";
    if (value.includes("IRONING")) return "IRONING";
    if (value.includes("PACKING")) return "PACKING";
    return null;
  };

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
      myTasksTitle: "My Tasks - Station",
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
          incomingItems.length > 0 ? (
            <div className="space-y-2">
              {incomingItems.map((item) => (
                <div key={item.orderStationId} className="rounded-xl border p-3 text-sm">
                  <p className="font-semibold">#{item.orderNo}</p>
                  <p className="text-muted-foreground">{item.customerName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.clothesCount} pakaian • {item.totalKg} kg
                  </p>
                </div>
              ))}
              {workerOutletId > 0 ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setNotificationOpen(false);
                    router.push(`/worker/${station.toLowerCase()}/orders/${workerOutletId}`);
                  }}
                >
                  Lihat Semua Incoming
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Tidak ada task masuk.</div>
          )
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
