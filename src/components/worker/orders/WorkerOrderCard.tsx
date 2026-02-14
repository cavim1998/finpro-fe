"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkerOrderListItem, WorkerStationKey } from "@/types/worker-order";

function formatDateTime(iso: string) {
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

function stationLabel(station: WorkerStationKey) {
  switch (station) {
    case "WASHING":
      return "Washing";
    case "IRONING":
      return "Ironing";
    case "PACKING":
      return "Packing";
    default:
      return "Station";
  }
}

type Props = {
  item: WorkerOrderListItem;

  /** Buat customize “warna” lewat class tailwind (contoh: "text-sky-600 bg-sky-50 border-sky-200") */
  badgeClassName?: string;

  /** Kalau false: card cuma display (tanpa dialog confirm) */
  enableCompleteInput?: boolean;

  /** Dipanggil saat worker confirm jumlah selesai */
  onConfirmComplete?: (args: {
    id: WorkerOrderListItem["id"];
    completedClothesCount: number;
  }) => Promise<void> | void;
};

export default function WorkerOrderCard({
  item,
  badgeClassName = "text-sky-700 bg-sky-50 border-sky-200",
  enableCompleteInput = true,
  onConfirmComplete,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [completed, setCompleted] = React.useState<number>(item.clothesCount);
  const [submitting, setSubmitting] = React.useState(false);

  const stationText = stationLabel(item.station);

  const onSubmit = async () => {
    if (!enableCompleteInput) return;

    // basic guard
    if (!Number.isFinite(completed) || completed < 0) return;

    try {
      setSubmitting(true);
      await onConfirmComplete?.({
        id: item.id,
        completedClothesCount: completed,
      });
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full text-left">
          <Card className="shadow-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
              {/* Header: OrderNo + Customer */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold leading-tight">
                    {item.orderNo} •{" "}
                    <span className="font-medium">{item.customerName}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Masuk: {formatDateTime(item.enteredAt)}
                  </p>
                </div>

                {/* Status badge */}
                <span
                  className={`shrink-0 text-[11px] px-2 py-1 rounded-full border ${badgeClassName}`}
                >
                  {stationText}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border p-2">
                  <p className="text-[11px] text-muted-foreground">Pakaian</p>
                  <p className="text-sm font-semibold">{item.clothesCount}</p>
                </div>
                <div className="rounded-lg border p-2">
                  <p className="text-[11px] text-muted-foreground">Total (Kg)</p>
                  <p className="text-sm font-semibold">{item.totalKg}</p>
                </div>
                <div className="rounded-lg border p-2">
                  <p className="text-[11px] text-muted-foreground">Aksi</p>
                  <p className="text-sm font-semibold">
                    {enableCompleteInput ? "Selesai" : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Pakaian Selesai</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {item.orderNo} • {item.customerName}
          </p>

          <label className="text-sm font-medium">Jumlah pakaian selesai</label>
          <Input
            type="number"
            min={0}
            value={Number.isNaN(completed) ? "" : completed}
            onChange={(e) => setCompleted(Number(e.target.value))}
          />

          <p className="text-xs text-muted-foreground">
            Default mengikuti jumlah pakaian: {item.clothesCount}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            Konfirmasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}