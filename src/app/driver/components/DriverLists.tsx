"use client";

import DriverPickupRequestList from "./DriverPickupRequestList";
import DriverTaskList from "./DriverTaskList";

type PickupLike = Record<string, unknown>;
type TaskLike = Record<string, unknown>;

type Props = {
  isAllowed: boolean;
  myTasks: TaskLike[];
  pickupRequests: PickupLike[];
  dashboardParams: {
    pageSize: number;
    taskPage: number;
    pickupPage: number;
  };
  pageSize: number;
  taskTotal: number | null;
  pickupTotal: number | null;
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
  pageSize,
  taskTotal,
  pickupTotal,
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <DriverTaskList
        isAllowed={isAllowed}
        myTasks={dashboardLoading ? [] : myTasks}
        page={dashboardParams.taskPage}
        hasNextPage={taskHasNextPage}
        dashboardMode
        showViewAll={false}
        totalItems={taskTotal}
        pageSize={pageSize}
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
        totalItems={pickupTotal}
        pageSize={pageSize}
        loading={dashboardLoading}
        onPrev={onPickupPrev}
        onNext={onPickupNext}
      />
    </div>
  );
}
