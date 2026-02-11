"use client";

import DriverPickupRequestList from "./DriverPickupRequestList";
import DriverTaskList from "./DriverTaskList";

type Props = {
  isAllowed: boolean;
};

export default function DriverLists({ isAllowed }: Props) {
  const myTasks: any[] = [];
  const pickupRequests: any[] = [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <DriverTaskList isAllowed={isAllowed} myTasks={myTasks} />
      <DriverPickupRequestList
        isAllowed={isAllowed}
        pickupRequests={pickupRequests}
      />
    </div>
  );
}
