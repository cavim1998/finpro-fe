"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { StationType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useWorkerStationOrdersQuery,
  useClaimWorkerOrderMutation,
} from "@/hooks/api/useWorkerStations";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { useProfileQuery } from "@/hooks/api/useProfile";
import WorkerIncomingOrdersCard from "./lists/WorkerIncomingOrdersCard";
import WorkerMyTasksCard from "./lists/WorkerMyTasksCard";
import { resolveWorkerListsLabels } from "./lists/shared";

type Props = {
  station: StationType;
  isAllowed: boolean;
  labels?: Partial<{
    myTasksTitle: string;
    incomingTitle: string;
    viewAll: string;
    emptyMyTasks: string;
    emptyIncoming: string;
  }>;
};

export default function WorkerLists({ station, isAllowed, labels }: Props) {
  const router = useRouter();
  const [incomingPage, setIncomingPage] = React.useState(1);
  const [claimWarningOpen, setClaimWarningOpen] = React.useState(false);
  const incomingLimit = 3;
  const attendanceTodayQ = useAttendanceTodayQuery({
    enabled: isAllowed,
  });
  const profileQ = useProfileQuery();
  const workerOutletId = Number(
    attendanceTodayQ.data?.outletId ??
      profileQ.data?.outletId ??
      profileQ.data?.outletStaff?.outletId ??
      profileQ.data?.staff?.outletId ??
      0,
  );
  const ordersHref =
    workerOutletId > 0
      ? `/worker/${station.toLowerCase()}/orders/${workerOutletId}`
      : `/worker/${station.toLowerCase()}/orders`;

  const resolvedLabels = resolveWorkerListsLabels(labels);

  const myQ = useWorkerStationOrdersQuery(station, "my", {
    enabled: isAllowed,
    outletId: workerOutletId,
    limit: 3,
    page: 1,
  });
  const incomingQ = useWorkerStationOrdersQuery(station, "incoming", {
    enabled: isAllowed,
    outletId: workerOutletId,
    limit: incomingLimit,
    page: incomingPage,
  });

  const claimM = useClaimWorkerOrderMutation();
  const myItems = myQ.data ?? [];
  const incomingItems = incomingQ.data ?? [];
  const hasNextIncomingPage = incomingItems.length === incomingLimit;
  const onClaim = (orderStationId: number) => {
    claimM.mutate(
      { stationType: station, orderStationId },
      {
        onSuccess: async () => {
          await Promise.all([myQ.refetch(), incomingQ.refetch(), attendanceTodayQ.refetch()]);
          router.refresh();
        },
      },
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <WorkerMyTasksCard
        station={station}
        isAllowed={isAllowed}
        labels={resolvedLabels}
        items={myItems}
        isLoading={myQ.isLoading}
        isError={myQ.isError}
      />

      <WorkerIncomingOrdersCard
        isAllowed={isAllowed}
        labels={resolvedLabels}
        ordersHref={ordersHref}
        items={incomingItems}
        incomingPage={incomingPage}
        hasNextIncomingPage={hasNextIncomingPage}
        isLoading={incomingQ.isLoading}
        isError={incomingQ.isError}
        isFetching={incomingQ.isFetching}
        claimPending={claimM.isPending}
        onPrevPage={() => setIncomingPage((current) => Math.max(1, current - 1))}
        onNextPage={() => setIncomingPage((current) => current + 1)}
        onClaim={(item) => {
          if (myItems.length > 0) {
            setClaimWarningOpen(true);
            return;
          }

          onClaim(item.orderStationId);
        }}
      />

      <Dialog open={claimWarningOpen} onOpenChange={setClaimWarningOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Task masih berjalan</DialogTitle>
            <DialogDescription>
              silakan selesaikan task sebelumnya sebelum mengambil task baru
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setClaimWarningOpen(false)}>Mengerti</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
