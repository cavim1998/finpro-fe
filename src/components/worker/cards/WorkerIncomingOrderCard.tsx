"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { StationTypeCode } from "@/features/workers/worker.api";
import { useClaimOrderMutation } from "@/features/workers/worker.hooks";

function formatDateTime(v?: string | Date | null) {
  if (!v) return "-";
  const d = typeof v === "string" ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCustomerName(order: any) {
  const prof = order?.customerProfile || order?.customer?.profile;
  return (
    prof?.fullName ||
    prof?.name ||
    order?.customerName ||
    order?.customer?.email ||
    "Pelanggan"
  );
}

function getItemCount(order: any) {
  if (Number.isFinite(order?.itemCount)) return Number(order.itemCount);
  if (Number.isFinite(order?.totalItems)) return Number(order.totalItems);

  const items = order?.items || order?.orderItems || order?.order_items;
  return Array.isArray(items) ? items.reduce((a, it) => a + Number(it?.qty ?? 1), 0) : 0;
}

type Props = {
  stationType: StationTypeCode;
  order: any;
  disabled?: boolean;
};

export default function WorkerIncomingOrderCard({ stationType, order, disabled }: Props) {
  const [open, setOpen] = React.useState(false);
  const claimM = useClaimOrderMutation(stationType);

  const customerName = getCustomerName(order);
  const createdAt = formatDateTime(order?.createdAt);
  const itemCount = getItemCount(order);

  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-base line-clamp-1">{customerName}</p>

        <Button variant="outline" size="sm" onClick={() => setOpen(v => !v)}>
          {open ? "Tutup" : "Detail"}
        </Button>
      </div>

      {open && (
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-muted-foreground">Jumlah item</p>
            <p className="font-medium">{itemCount}</p>

            <p className="mt-2 text-muted-foreground">Waktu order</p>
            <p className="font-medium">{createdAt}</p>
          </div>

          <Button
            className="w-full"
            disabled={disabled || claimM.isPending}
            onClick={() => claimM.mutateAsync(Number(order?.id))}
          >
            {claimM.isPending ? "Memproses..." : "Claim Order"}
          </Button>

          {claimM.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700">
              {(claimM.error as any)?.response?.data?.message ?? "Gagal claim order."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}