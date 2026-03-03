"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useClockOutMutation } from "@/hooks/api/useAttendanceMutations";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { useProfileQuery } from "@/hooks/api/useProfile";
import { useDriverDashboard } from "@/features/driver/useDriverDashboard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const profileQ = useProfileQuery();
  const attendanceQ = useAttendanceTodayQuery();
  const clockOutM = useClockOutMutation();

  const pageSize = 2;
  const [taskPage, setTaskPage] = useState(1);
  const [pickupPage, setPickupPage] = useState(1);
  const [notificationOpen, setNotificationOpen] = useState<boolean | null>(null);

  const dashboardQ = useDriverDashboard({ pageSize, taskPage, pickupPage });
  const nextDashboardQ = useDriverDashboard({
    pageSize,
    taskPage: taskPage + 1,
    pickupPage: pickupPage + 1,
  });

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
  const taskTotal = Number(
    stats.inProgress ?? (tasks.length < pageSize ? tasks.length : NaN),
  );
  const pickupTotal = Number(
    dashboardQ.data?.pickupRequests?.total ??
      (pickupRequests.length < pageSize ? pickupRequests.length : NaN),
  );
  const pickupTotalPages = Number(dashboardQ.data?.pickupRequests?.totalPages ?? 0);
  const nextTasks = (nextDashboardQ.data?.tasks?.items ?? []).filter(isActiveTask);
  const nextPickupRequests = nextDashboardQ.data?.pickupRequests?.items ?? [];

  const taskHasNextByCount =
    Number.isFinite(taskTotal) ? taskPage * pageSize < taskTotal : tasks.length === pageSize;
  const pickupHasNextByCount =
    (pickupTotalPages > 0 && pickupPage < pickupTotalPages) ||
    (Number.isFinite(pickupTotal)
      ? pickupPage * pageSize < pickupTotal
      : pickupRequests.length === pageSize);
  const taskHasNextPage = taskHasNextByCount && nextTasks.length > 0;
  const pickupHasNextPage = pickupHasNextByCount && nextPickupRequests.length > 0;

  const resolvedNotificationOpen =
    notificationOpen ?? (isAllowed && pickupRequests.length > 0);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-24 px-4">
      <DriverHeader
        displayName={displayName}
        loadingToday={attendanceQ.isLoading}
        isCheckedIn={isCheckedIn}
        isCompleted={isCompleted}
        sinceText={sinceText}
        onClockOut={onClockOut}
        clockOutLoading={clockOutM.isPending}
        incomingCount={Number(stats.incoming ?? 0)}
        notificationOpen={resolvedNotificationOpen}
        onNotificationOpenChange={setNotificationOpen}
        notificationContent={
          pickupRequests.length > 0 ? (
            <div className="space-y-2">
              {pickupRequests.slice(0, 5).map((item, index) => {
                const record =
                  typeof item === "object" && item !== null
                    ? (item as Record<string, unknown>)
                    : {};
                const title = String(
                  record.customerName ??
                    (record.customer as { email?: string } | undefined)?.email ??
                    `Task ${index + 1}`,
                );
                const id = String(record.id ?? record.pickupId ?? record.orderId ?? index);

                return (
                  <div key={id} className="rounded-xl border p-3 text-sm">
                    <p className="font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {id}
                    </p>
                  </div>
                );
              })}
              {Number.isFinite(Number(today?.outletId ?? 0)) && Number(today?.outletId ?? 0) > 0 ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setNotificationOpen(false);
                    router.push(`/driver/pickups/${Number(today?.outletId)}`);
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
        <DriverStats
          incoming={dashboardQ.isFetching ? 0 : stats.incoming}
          inProgress={dashboardQ.isFetching ? 0 : stats.inProgress}
          completed={dashboardQ.isFetching ? 0 : stats.completed}
        />

        <DriverLists
          isAllowed={isAllowed}
          myTasks={tasks}
          pickupRequests={pickupRequests}
          dashboardParams={{ pageSize, taskPage, pickupPage }}
          pageSize={pageSize}
          taskTotal={Number.isFinite(taskTotal) ? taskTotal : null}
          pickupTotal={Number.isFinite(pickupTotal) ? pickupTotal : null}
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
