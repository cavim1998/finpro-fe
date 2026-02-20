"use client";

import * as React from "react";
import type { StationType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Loader2 } from "lucide-react";
import {
  useWorkerStationOrdersQuery,
  useClaimWorkerOrderMutation,
  type WorkerOrderListItem,
} from "@/hooks/api/useWorkerStations";

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
  right,
}: {
  item: WorkerOrderListItem;
  right?: React.ReactNode;
}) {
  const totalKg = typeof item.totalKg === "string" ? Number(item.totalKg) : item.totalKg;

  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b last:border-b-0">
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
  const l = {
    myTasksTitle: labels?.myTasksTitle ?? "My Tasks / Station",
    incomingTitle: labels?.incomingTitle ?? "Incoming Orders",
    viewAll: labels?.viewAll ?? "View all",
    emptyMyTasks: labels?.emptyMyTasks ?? "Belum ada task.",
    emptyIncoming: labels?.emptyIncoming ?? "Belum ada incoming order.",
  };

  const myQ = useWorkerStationOrdersQuery(station, "my", { enabled: isAllowed, limit: 3, page: 1 });
  const incomingQ = useWorkerStationOrdersQuery(station, "incoming", { enabled: isAllowed, limit: 3, page: 1 });

  const claimM = useClaimWorkerOrderMutation();

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
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{l.myTasksTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderBody(myQ, l.emptyMyTasks)}
        </CardContent>
      </Card>

      {/* INCOMING */}
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{l.incomingTitle}</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1" type="button">
            {l.viewAll} <ChevronRight className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          {renderBody(incomingQ, l.emptyIncoming, (it) => (
            <OrderRow
              key={it.orderStationId}
              item={it}
              right={
                <Button
                  size="sm"
                  className="rounded-xl"
                  disabled={claimM.isPending}
                  onClick={() => claimM.mutate({ stationType: station, orderId: it.orderId })}
                >
                  {claimM.isPending ? "..." : "Claim"}
                </Button>
              }
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}