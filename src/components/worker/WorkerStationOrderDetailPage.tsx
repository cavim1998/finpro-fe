"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfileQuery } from "@/hooks/api/useProfile";
import { useWorkerOrderDetailQuery } from "@/hooks/api/useWorkerStations";
import type { StationType } from "@/types";
import { ArrowLeft, Loader2 } from "lucide-react";
import WorkerOrderDetailActions from "./order-detail/WorkerOrderDetailActions";
import WorkerOrderItemCounters from "./order-detail/WorkerOrderItemCounters";
import WorkerOrderDetailSummary from "./order-detail/WorkerOrderDetailSummary";
import { getOutletStaffId } from "./order-detail/shared";
import useWorkerOrderDetailState from "./order-detail/useWorkerOrderDetailState";

type Props = {
  station: StationType;
  stationPath: "/worker/washing" | "/worker/ironing" | "/worker/packing";
  historyMode?: boolean;
};

export default function WorkerStationOrderDetailPage({
  station,
  stationPath,
  historyMode = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ slug?: string; orderId?: string }>();
  const profileQ = useProfileQuery();
  const routeValue = params?.orderId ?? params?.slug;
  const orderId = Array.isArray(routeValue) ? routeValue[0] : routeValue;
  const isReadOnly = historyMode || searchParams.get("readonly") === "1";
  const from = searchParams.get("from");
  const historyOutletStaffId = getOutletStaffId(profileQ.data);
  const backHref = historyMode
    ? historyOutletStaffId
      ? `${stationPath}/history/${historyOutletStaffId}`
      : `${stationPath}/history`
    : isReadOnly && from === "orders"
      ? `${stationPath}/orders`
      : stationPath;
  const orderQ = useWorkerOrderDetailQuery(orderId ?? "", {
    enabled: !!orderId,
    refetchInterval: false,
  });
  const order = orderQ.data;
  const detailState = useWorkerOrderDetailState({
    station,
    stationPath,
    historyMode,
    isReadOnly,
    orderId,
    order,
    refetchOrder: orderQ.refetch,
    navigatePush: router.push,
    navigateReplace: router.replace,
  });

  React.useEffect(() => {
    if (!orderId) return;
    if (!detailState.refetchInterval) return;

    const timer = window.setInterval(() => {
      void orderQ.refetch();
    }, detailState.refetchInterval);

    return () => window.clearInterval(timer);
  }, [detailState.refetchInterval, orderId, orderQ]);

  return (
    <RequireCheckInRQ
      roles={["WORKER"]}
      redirectTo={
        orderId
          ? `/attendance?next=${historyMode ? `${stationPath}/history/order/${orderId}` : `${stationPath}/order/${orderId}`}`
          : `/attendance?next=${stationPath}`
      }
    >
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="border-b-1">
          <NavbarWorker />
        </div>

        <div className="container mx-auto px-4 py-6 pb-24 space-y-4">
          <Button
            asChild
            variant="ghost"
            className="gap-2 text-[#1DACBC] hover:bg-[#1DACBC]/5 hover:text-[#138A96]"
          >
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Link>
          </Button>

          <Card className="rounded-2xl border border-[#1DACBC]/30 transition-shadow hover:shadow-[0_16px_36px_rgba(29,172,188,0.14)]">
            <CardHeader>
              <CardTitle className="text-lg text-[#1DACBC]">Detail Order</CardTitle>
            </CardHeader>
            <CardContent>
              {orderQ.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading detail order...
                </div>
              ) : orderQ.isError ? (
                <div className="text-sm text-destructive">Gagal memuat detail order.</div>
              ) : (
                <div className="space-y-4">
                  <WorkerOrderDetailSummary
                    orderLabel={detailState.orderLabel}
                    customerName={detailState.customerName}
                    isBypassLocked={detailState.isBypassLocked}
                    orderStatus={order?.status}
                    outletName={order?.outlet?.name}
                    createdAt={order?.createdAt}
                  />

                  <WorkerOrderItemCounters
                    items={detailState.hydratedItems}
                    isReadOnly={isReadOnly}
                    isBypassLocked={detailState.isBypassLocked}
                    actionLoading={detailState.actionLoading}
                    hasInvalidItemId={detailState.hasInvalidItemId}
                    onChangeQty={detailState.setQty}
                  />

                  <WorkerOrderDetailActions
                    isReadOnly={isReadOnly}
                    isMatched={detailState.isMatched}
                    isBypassLocked={detailState.isBypassLocked}
                    actionLoading={detailState.actionLoading}
                    hasAnyItem={detailState.hasAnyItem}
                    hasInvalidItemId={detailState.hasInvalidItemId}
                    reason={detailState.reason}
                    onReasonChange={detailState.setReason}
                    onSubmit={detailState.onSubmit}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <BottomNav role="WORKER" workerHomePath={stationPath} />
      </div>
    </RequireCheckInRQ>
  );
}
