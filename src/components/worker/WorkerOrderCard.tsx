"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type WorkerOrderCardProps = {
  orderId: string | number;
  customerName: string;

  clothesCount: number;
  totalKg: number;
  enteredAt: string | Date;
  statusLabel: string;

  onClick?: () => void;

  accentClassName?: string; 
};



function formatTime(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatKg(kg: number) {
  if (typeof kg !== "number" || Number.isNaN(kg)) return "-";
  // contoh: 3.5 => "3,5"
  return `${kg.toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg`;
}

export function WorkerOrderCard({
  orderId,
  customerName,
  clothesCount,
  totalKg,
  enteredAt,
  statusLabel,
  onClick,
  accentClassName,
}: WorkerOrderCardProps) {
  return (
    <Card
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className={cn(
        "rounded-2xl border p-4 transition-colors",
        onClick && "cursor-pointer hover:bg-muted/40 active:scale-[0.99]"
      )}
    >
      {/* Row 1: Order + Customer */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">
            Order #{String(orderId)} • {customerName}
          </div>
          <div className="text-xs text-muted-foreground">
            Masuk: {formatTime(enteredAt)}
          </div>
        </div>

        {/* Status pill */}
        <div
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
            accentClassName ?? "text-sky-600"
          )}
        >
          {statusLabel}
        </div>
      </div>

      {/* Row 2: stats */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-3">
          <div className="text-[11px] text-muted-foreground">Jumlah pakaian</div>
          <div className="text-sm font-semibold">{clothesCount} pcs</div>
        </div>

        <div className="rounded-xl border bg-card p-3">
          <div className="text-[11px] text-muted-foreground">Total</div>
          <div className="text-sm font-semibold">{formatKg(totalKg)}</div>
        </div>
      </div>
    </Card>
  );
}