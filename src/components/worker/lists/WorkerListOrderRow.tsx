"use client";

import type { ReactNode } from "react";
import type { WorkerOrderListItem } from "@/hooks/api/useWorkerStations";
import {
  formatEnteredAt,
  formatWorkerOrderShortLabel,
  formatWorkerServiceType,
  getWorkerServiceTypeBadgeClass,
} from "./shared";

type Props = {
  item: WorkerOrderListItem;
  hoverClassName?: string;
  accentClassName?: string;
  right?: ReactNode;
};

export default function WorkerListOrderRow({
  item,
  hoverClassName,
  accentClassName,
  right,
}: Props) {
  const totalKg = typeof item.totalKg === "string" ? Number(item.totalKg) : item.totalKg;

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border p-2.5 py-3 transition-all last:border-b-0 ${accentClassName ?? ""} ${hoverClassName ?? ""}`}
    >
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <span>#{formatWorkerOrderShortLabel(item.orderNo)} • </span>
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal ${getWorkerServiceTypeBadgeClass(item.serviceType)}`}
          >
            {formatWorkerServiceType(item.serviceType)}
          </span>
        </div>
        <div className="mt-1 truncate font-semibold">
          {item.customerName}
        </div>
        <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
          <div>Total: {Number.isFinite(totalKg) ? totalKg : item.totalKg} kg</div>
          <div>Masuk: {formatEnteredAt(item.enteredAt)}</div>
          <div>Status: {item.stationStatus}</div>
        </div>
      </div>
      {right ? <div className="shrink-0 self-center">{right}</div> : null}
    </div>
  );
}
