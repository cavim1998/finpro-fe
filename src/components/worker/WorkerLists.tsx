"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StationType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronRight, Loader2 } from "lucide-react";
import {
  useWorkerStationOrdersQuery,
  useClaimWorkerOrderMutation,
  type WorkerOrderListItem,
} from "@/hooks/api/useWorkerStations";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { useProfileQuery } from "@/hooks/api/useProfile";

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

function formatEnteredAt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function OrderRow({
  item,
  hoverClassName,
  right,
}: {
  item: WorkerOrderListItem;
  hoverClassName?: string;
  right?: React.ReactNode;
}) {
  const totalKg = typeof item.totalKg === "string" ? Number(item.totalKg) : item.totalKg;

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-2xl border p-2.5 py-3 last:border-b-0 transition-all ${hoverClassName ?? ""}`}
    >
      <div className="min-w-0">
        <div className="font-semibold truncate">
          #{item.orderNo} • {item.customerName}
        </div>
        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
          <div>Jumlah pakaian: {item.clothesCount}</div>
          <div>Total: {Number.isFinite(totalKg) ? totalKg : item.totalKg} kg</div>
          <div>Masuk: {formatEnteredAt(item.enteredAt)}</div>
          <div>Status: {item.stationStatus}</div>
        </div>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

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

  const l = {
    myTasksTitle: labels?.myTasksTitle ?? "My Tasks / Station",
    incomingTitle: labels?.incomingTitle ?? "Incoming Orders",
    viewAll: labels?.viewAll ?? "View all",
    emptyMyTasks: labels?.emptyMyTasks ?? "Belum ada task.",
    emptyIncoming: labels?.emptyIncoming ?? "Belum ada incoming order.",
  };
  const stationAccentClass =
    station === "WASHING"
      ? "text-blue-500"
      : station === "IRONING"
        ? "text-red-500"
        : "text-[#1dacbc]";
  const stationContainerClass =
    station === "WASHING"
      ? "border-blue-200 hover:border-blue-500 hover:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
      : station === "IRONING"
        ? "border-red-200 hover:border-red-500 hover:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
        : "border-cyan-200 hover:border-[#1dacbc] hover:shadow-[0_0_0_3px_rgba(29,172,188,0.12)]";
  const incomingAccentClass = "text-[#1dacbc]";
  const incomingContainerClass =
    "border-cyan-200 hover:border-[#1dacbc] hover:shadow-[0_0_0_3px_rgba(29,172,188,0.12)]";
  const stationItemHoverClass =
    station === "WASHING"
      ? "hover:shadow-[0_0_0_3px_rgba(59,130,246,0.10)]"
      : station === "IRONING"
        ? "hover:shadow-[0_0_0_3px_rgba(239,68,68,0.10)]"
        : "hover:shadow-[0_0_0_3px_rgba(29,172,188,0.10)]";
  const incomingItemHoverClass =
    "hover:shadow-[0_0_0_3px_rgba(29,172,188,0.10)]";

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

  const renderBody = (q: typeof myQ, emptyText: string, renderItem?: (it: WorkerOrderListItem) => React.ReactNode) => {
    if (!isAllowed) return <div className="text-sm text-muted-foreground">Silakan check-in dulu.</div>;
    if (q.isLoading) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      );
    }
    if (q.isError) {
      return (
        <div className="text-sm text-destructive">
          Gagal memuat data.
        </div>
      );
    }

    const items = q.data ?? [];
    if (items.length === 0) return <div className="text-sm text-muted-foreground">{emptyText}</div>;

    return (
      <div>
        {items.map((it) =>
          renderItem ? renderItem(it) : <OrderRow key={it.orderStationId} item={it} />
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* MY TASKS */}
      <Card className={`rounded-2xl transition-all ${stationContainerClass}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className={`text-base ${stationAccentClass}`}>{l.myTasksTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderBody(myQ, l.emptyMyTasks, (it) => (
            <OrderRow
              key={it.orderStationId}
              item={it}
              hoverClassName={stationItemHoverClass}
              right={
                <Button asChild size="sm" variant="outline" className="rounded-xl">
                  <Link href={`/worker/${station.toLowerCase()}/order/${encodeURIComponent(it.orderId)}`}>
                    View detail
                  </Link>
                </Button>
              }
            />
          ))}
        </CardContent>
      </Card>

      {/* INCOMING */}
      <Card className={`rounded-2xl transition-all ${incomingContainerClass}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className={`text-base ${incomingAccentClass}`}>{l.incomingTitle}</CardTitle>
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link href={ordersHref}>
              {l.viewAll} <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          {!isAllowed ? (
            <div className="text-sm text-muted-foreground">Silakan check-in dulu.</div>
          ) : incomingQ.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : incomingQ.isError ? (
            <div className="text-sm text-destructive">Gagal memuat data.</div>
          ) : incomingItems.length === 0 ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">{l.emptyIncoming}</div>
              {incomingPage > 1 ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIncomingPage((p) => Math.max(1, p - 1))}
                >
                  Halaman sebelumnya
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                {incomingItems.map((it) => (
                  <OrderRow
                    key={it.orderStationId}
                    item={it}
                    hoverClassName={incomingItemHoverClass}
                    right={
                      <Button
                        size="sm"
                        className="rounded-xl"
                        disabled={claimM.isPending}
                        onClick={() => {
                          if (myItems.length > 0) {
                            setClaimWarningOpen(true);
                            return;
                          }

                          claimM.mutate(
                            { stationType: station, orderStationId: it.orderStationId },
                            {
                              onSuccess: async () => {
                                await Promise.all([
                                  myQ.refetch(),
                                  incomingQ.refetch(),
                                  attendanceTodayQ.refetch(),
                                ]);
                                router.refresh();
                              },
                            },
                          );
                        }}
                      >
                        {claimM.isPending ? "..." : "Claim"}
                      </Button>
                    }
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIncomingPage((p) => Math.max(1, p - 1))}
                  disabled={incomingPage === 1 || incomingQ.isFetching}
                >
                  Prev
                </Button>

                <div className="text-xs text-muted-foreground">Page {incomingPage}</div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIncomingPage((p) => p + 1)}
                  disabled={!hasNextIncomingPage || incomingQ.isFetching}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
