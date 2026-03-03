"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { StationType } from "@/types";
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
  const [myPage, setMyPage] = React.useState(1);
  const [incomingPage, setIncomingPage] = React.useState(1);
  const myLimit = 2;
  const incomingLimit = 2;
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
    limit: myLimit,
    page: myPage,
  });
  const incomingQ = useWorkerStationOrdersQuery(station, "incoming", {
    enabled: isAllowed,
    outletId: workerOutletId,
    limit: incomingLimit,
    page: incomingPage,
  });

  const claimM = useClaimWorkerOrderMutation();
  const myItems = myQ.data?.items ?? [];
  const incomingItems = incomingQ.data?.items ?? [];
  const myTotal = Number(
    myQ.data?.pagination?.total ?? (myItems.length < myLimit ? myItems.length : NaN),
  );
  const incomingTotal = Number(
    incomingQ.data?.pagination?.total ?? (incomingItems.length < incomingLimit ? incomingItems.length : NaN),
  );
  const hasNextMyPageByCount = Number.isFinite(myTotal)
    ? myPage * myLimit < myTotal
    : myItems.length === myLimit;
  const hasNextIncomingPageByCount = Number.isFinite(incomingTotal)
    ? incomingPage * incomingLimit < incomingTotal
    : incomingItems.length === incomingLimit;
  const nextMyQ = useWorkerStationOrdersQuery(station, "my", {
    enabled: isAllowed && hasNextMyPageByCount,
    outletId: workerOutletId,
    limit: myLimit,
    page: myPage + 1,
  });
  const nextIncomingQ = useWorkerStationOrdersQuery(station, "incoming", {
    enabled: isAllowed && hasNextIncomingPageByCount,
    outletId: workerOutletId,
    limit: incomingLimit,
    page: incomingPage + 1,
  });
  const hasNextMyPage = hasNextMyPageByCount && (nextMyQ.data?.items?.length ?? 0) > 0;
  const hasNextIncomingPage =
    hasNextIncomingPageByCount && (nextIncomingQ.data?.items?.length ?? 0) > 0;
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
        currentPage={myPage}
        hasNextPage={hasNextMyPage}
        totalItems={Number.isFinite(myTotal) ? myTotal : null}
        pageSize={myLimit}
        isLoading={myQ.isLoading}
        isError={myQ.isError}
        isFetching={myQ.isFetching}
        onPrevPage={() => setMyPage((current) => Math.max(1, current - 1))}
        onNextPage={() => setMyPage((current) => current + 1)}
      />

      <WorkerIncomingOrdersCard
        isAllowed={isAllowed}
        labels={resolvedLabels}
        ordersHref={ordersHref}
        items={incomingItems}
        incomingPage={incomingPage}
        hasNextIncomingPage={hasNextIncomingPage}
        totalItems={Number.isFinite(incomingTotal) ? incomingTotal : null}
        pageSize={incomingLimit}
        isLoading={incomingQ.isLoading}
        isError={incomingQ.isError}
        isFetching={incomingQ.isFetching}
        claimPending={claimM.isPending}
        onPrevPage={() => setIncomingPage((current) => Math.max(1, current - 1))}
        onNextPage={() => setIncomingPage((current) => current + 1)}
        onClaim={(item) => onClaim(item.orderStationId)}
      />
    </div>
  );
}
