"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime, formatStatus } from "./shared";

type Props = {
  orderLabel: string;
  customerName: string;
  isBypassLocked: boolean;
  orderStatus?: string;
  outletName?: string | null;
  createdAt?: string;
};

export default function WorkerOrderDetailSummary({
  orderLabel,
  customerName,
  isBypassLocked,
  orderStatus,
  outletName,
  createdAt,
}: Props) {
  return (
    <Card className="rounded-xl border border-[#1DACBC]/20 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-[#138A96]">#{orderLabel}</div>
            <div className="mt-1 text-sm text-muted-foreground">{customerName}</div>
          </div>
          {isBypassLocked ? (
            <div className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Bypass: Menunggu keputusan admin
            </div>
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <div className="text-muted-foreground">Status Order</div>
            <div className="font-medium">{formatStatus(orderStatus)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Outlet</div>
            <div className="font-medium">{outletName ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Dibuat</div>
            <div className="font-medium">{formatDateTime(createdAt)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
