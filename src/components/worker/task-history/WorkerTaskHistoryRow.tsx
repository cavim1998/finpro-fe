"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { WorkerTaskHistoryItem } from "@/hooks/api/useWorkerTaskHistory";
import {
  formatDateTime,
  getCustomerName,
  getDetailHref,
  getOrderNumber,
  getPrimaryTimestamp,
  getStatus,
} from "./shared";

type Props = {
  item: WorkerTaskHistoryItem;
  stationPath: string;
};

export default function WorkerTaskHistoryRow({ item, stationPath }: Props) {
  const detailHref = getDetailHref(item, stationPath);

  return (
    <div className="rounded-2xl border border-green-200 p-3 transition-shadow hover:shadow-[0_16px_36px_rgba(34,197,94,0.14)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold text-green-600">
            #{getOrderNumber(item)} • {getCustomerName(item)}
          </div>
          <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            <div>Status: {getStatus(item)}</div>
            <div>Waktu: {formatDateTime(getPrimaryTimestamp(item))}</div>
          </div>
        </div>

        {detailHref ? (
          <Button
            asChild
            size="sm"
            variant="outline"
            className="shrink-0 rounded-xl border-green-200 text-green-600 hover:bg-green-50"
          >
            <Link href={detailHref}>Detail</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
