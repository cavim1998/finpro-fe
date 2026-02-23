"use client";

import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useWorkerStationOrdersQuery,
  type WorkerOrderListItem,
} from "@/hooks/api/useWorkerStations";
import type { StationType } from "@/types";
import { Loader2 } from "lucide-react";

function formatEnteredAt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  station: StationType;
  title: string;
  subtitle?: string;
};

function CompletedRow({ station, item }: { station: StationType; item: WorkerOrderListItem }) {
  const totalKg = typeof item.totalKg === "string" ? Number(item.totalKg) : item.totalKg;

  return (
    <div className="flex items-start justify-between gap-3 py-3 border rounded-2xl p-2.5">
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

      <Button asChild size="sm" variant="outline" className="rounded-xl shrink-0">
        <Link
          href={`/worker/${station.toLowerCase()}/order/${encodeURIComponent(item.orderId)}?readonly=1&from=orders`}
        >
          Detail
        </Link>
      </Button>
    </div>
  );
}

export default function WorkerCompletedOrders({ station, title, subtitle }: Props) {
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const completedQ = useWorkerStationOrdersQuery(station, "completed", {
    enabled: true,
    page,
    limit,
  });

  const items = completedQ.data ?? [];
  const hasNextPage = items.length === limit;

  return (
    <div className="container mx-auto px-4 py-6 pb-24 space-y-4">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {subtitle ? <div className="text-sm text-muted-foreground">{subtitle}</div> : null}
        </CardHeader>
        <CardContent className="space-y-3">
          {completedQ.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : completedQ.isError ? (
            <div className="text-sm text-destructive">Gagal memuat data order selesai.</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">Belum ada order yang selesai dikerjakan.</div>
          ) : (
            <div className="space-y-2">
              {items.map((it) => (
                <CompletedRow key={it.orderStationId} station={station} item={it} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || completedQ.isFetching}
            >
              Prev
            </Button>

            <div className="text-xs text-muted-foreground">Page {page}</div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage || completedQ.isFetching}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
