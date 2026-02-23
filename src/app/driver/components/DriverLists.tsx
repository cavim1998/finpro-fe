"use client";

import DriverPickupRequestList from "./DriverPickupRequestList";
import DriverTaskList from "./DriverTaskList";

type Props = {
  isAllowed: boolean;
  myTasks: unknown[];
  pickupRequests: unknown[];
  dashboardParams: {
    pageSize: number;
    taskPage: number;
    pickupPage: number;
  };
  onTaskPrev: () => void;
  onTaskNext: () => void;
  onPickupPrev: () => void;
  onPickupNext: () => void;
  taskHasNextPage: boolean;
  pickupHasNextPage: boolean;
  dashboardLoading?: boolean;
  dashboardError?: boolean;
};

export default function DriverLists({
  isAllowed,
  myTasks,
  pickupRequests,
  dashboardParams,
  onTaskPrev,
  onTaskNext,
  onPickupPrev,
  onPickupNext,
  taskHasNextPage,
  pickupHasNextPage,
  dashboardLoading,
  dashboardError,
}: Props) {
  if (dashboardError) {
    return (
      <div className="text-sm text-red-600">
        Gagal memuat dashboard driver.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <DriverTaskList
        isAllowed={isAllowed}
        myTasks={dashboardLoading ? [] : myTasks}
        page={dashboardParams.taskPage}
        hasNextPage={taskHasNextPage}
        loading={dashboardLoading}
        onPrev={onTaskPrev}
        onNext={onTaskNext}
      />
      <DriverPickupRequestList
        isAllowed={isAllowed}
        pickupRequests={dashboardLoading ? [] : pickupRequests}
        dashboardParams={dashboardParams}
        page={dashboardParams.pickupPage}
        hasNextPage={pickupHasNextPage}
        loading={dashboardLoading}
        onPrev={onPickupPrev}
        onNext={onPickupNext}
      />
    </div>
  );
}
