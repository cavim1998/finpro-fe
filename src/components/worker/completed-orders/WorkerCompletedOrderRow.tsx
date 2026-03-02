"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { WorkerOrderListItem } from "@/hooks/api/useWorkerStations";
import type { StationType } from "@/types";
import { formatEnteredAt, getStationTheme } from "./shared";

type Props = {
  station: StationType;
  item: WorkerOrderListItem;
};

export default function WorkerCompletedOrderRow({ station, item }: Props) {
  const totalKg = typeof item.totalKg === "string" ? Number(item.totalKg) : item.totalKg;
  const theme = getStationTheme(station);

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-2xl border p-2.5 py-3 transition-shadow ${theme.borderClass} ${theme.hoverShadowClass}`}
    >
      <div className="min-w-0">
        <div className={`truncate font-semibold ${theme.textClass}`}>
          #{item.orderNo} • {item.customerName}
        </div>
        <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
          <div>Jumlah pakaian: {item.clothesCount}</div>
          <div>Total: {Number.isFinite(totalKg) ? totalKg : item.totalKg} kg</div>
          <div>Masuk: {formatEnteredAt(item.enteredAt)}</div>
          <div>Status: {item.stationStatus}</div>
        </div>
      </div>

      <Button
        asChild
        size="sm"
        variant="outline"
        className={`shrink-0 rounded-xl ${theme.ghostButtonClass}`}
      >
        <Link
          href={`/worker/${station.toLowerCase()}/order/${encodeURIComponent(item.orderId)}?readonly=1&from=orders`}
        >
          Detail
        </Link>
      </Button>
    </div>
  );
}
