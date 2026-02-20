"use client";

import DriverPickupRequestList from "./DriverPickupRequestList";
import DriverTaskList from "./DriverTaskList";

type Props = {
  isAllowed: boolean;
  myTasks: any[];
  pickupRequests: any[];
  dashboardLoading?: boolean;
  dashboardError?: boolean;
};

export default function DriverLists({
  isAllowed,
  myTasks,
  pickupRequests,
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
      />
      <DriverPickupRequestList
        isAllowed={isAllowed}
        pickupRequests={dashboardLoading ? [] : pickupRequests}
      />
    </div>
  );
}