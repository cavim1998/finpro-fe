"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Package } from "lucide-react";
import type { WorkerOrderCard as WorkerOrderCardType } from "@/types/worker-station";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  item: WorkerOrderCardType;
  rightSlot?: React.ReactNode; // tombol Claim / dsb
  onClick?: () => void;
};

export default function WorkerOrderCard({ item, rightSlot, onClick }: Props) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              Order <span className="font-semibold text-foreground">{item.orderNo}</span>
            </p>
            <p className="text-lg font-bold truncate">{item.customerName}</p>
          </div>

          {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>{item.clothesCount} pcs</span>
          </div>

          <div className="text-right font-medium">{item.totalKg} kg</div>

          <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Masuk: {formatDateTime(item.enteredAt)}</span>
          </div>

          <div className="col-span-2">
            <span className="text-xs rounded-md border px-2 py-1">
              Status: {item.stationStatus}
            </span>
          </div>
        </div>

        {/* optional click area */}
        {onClick ? (
          <div className="mt-3">
            <Button variant="ghost" className="w-full" onClick={onClick}>
              Lihat detail
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}