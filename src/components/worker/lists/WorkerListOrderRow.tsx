"use client";

import type { ReactNode } from "react";
import type { WorkerOrderListItem } from "@/hooks/api/useWorkerStations";
import { formatEnteredAt } from "./shared";

type Props = {
  item: WorkerOrderListItem;
  hoverClassName?: string;
  right?: ReactNode;
};

export default function WorkerListOrderRow({ item, hoverClassName, right }: Props) {
  const totalKg = typeof item.totalKg === "string" ? Number(item.totalKg) : item.totalKg;

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-2xl border p-2.5 py-3 transition-all last:border-b-0 ${hoverClassName ?? ""}`}
    >
      <div className="min-w-0">
        <div className="truncate font-semibold">
          #{item.orderNo} • {item.customerName}
        </div>
        <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
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
