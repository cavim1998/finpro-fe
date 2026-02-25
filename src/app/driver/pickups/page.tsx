"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { useDriverDashboard } from "@/features/driver/useDriverDashboard";
import DriverPickupRequestList from "@/app/driver/components/DriverPickupRequestList";

export default function DriverPickupsPage() {
  const pageSize = 10;
  const taskPage = 1;
  const [pickupPage, setPickupPage] = useState(1);

  const attendanceQ = useAttendanceTodayQuery();
  const isAllowed = !!attendanceQ.data?.isCheckedIn && !attendanceQ.data?.isCompleted;

  const dashboardQ = useDriverDashboard({ pageSize, taskPage, pickupPage });
  const tasks = dashboardQ.data?.tasks?.items ?? [];
  const inProgress = Number(dashboardQ.data?.stats?.inProgress ?? 0);
  const hasActiveTask = tasks.length > 0 || inProgress > 0;
  const pickupRequests = dashboardQ.data?.pickupRequests?.items ?? [];
  const totalPages = Number(dashboardQ.data?.pickupRequests?.totalPages ?? 0);
  const hasNextPage =
    (totalPages > 0 && pickupPage < totalPages) || pickupRequests.length === pageSize;

  return (
    <RequireCheckInRQ roles={["DRIVER"]} redirectTo="/attendance?next=/driver/pickups">
      <NavbarWorker />

      <div className="container mx-auto px-4 py-6 pb-24">
        <DriverPickupRequestList
          title="All Pickup Requests"
          isAllowed={isAllowed}
          pickupRequests={pickupRequests}
          dashboardParams={{ pageSize, taskPage, pickupPage }}
          hasActiveTask={hasActiveTask}
          page={pickupPage}
          hasNextPage={hasNextPage}
          loading={dashboardQ.isFetching}
          onPrev={() => setPickupPage((p) => Math.max(1, p - 1))}
          onNext={() => setPickupPage((p) => p + 1)}
          showViewAll={false}
        />
      </div>

      <BottomNav role="DRIVER" />
    </RequireCheckInRQ>
  );
}
