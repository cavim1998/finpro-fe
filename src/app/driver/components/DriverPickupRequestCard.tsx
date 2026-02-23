"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useClaimPickupMutation } from "@/features/driver/driver.hooks";
import type { DriverDashboardParams } from "@/features/driver/driver.api";

type Props = {
  pickup: unknown;
  dashboardParams: DriverDashboardParams;
  disabled?: boolean;
};

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

function getObj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
}

function getAddressText(pickup: Record<string, unknown>) {
  const addr =
    pickup.address ??
    pickup.customerAddress ??
    pickup.customer_address ??
    pickup.addressText;

  if (typeof addr === "string") return addr;

  const a = getObj(addr);
  return String(a.addressText ?? a.label ?? a.receiverName ?? a.receiverPhone ?? "-");
}

export default function DriverPickupRequestCard({ pickup, dashboardParams, disabled }: Props) {
  const [open, setOpen] = React.useState(false);
  const p = getObj(pickup);
  const claimM = useClaimPickupMutation(dashboardParams);

  const pickupId = Number(p.id);
  const customer = getObj(p.customer);
  const profile = getObj(customer.profile);

  const customerName =
    String(profile.fullName ?? profile.name ?? p.customerName ?? customer.email ?? "Pelanggan");
  const address = getAddressText(p);
  const createdAt = formatDateTime((p.createdAt as string | undefined) ?? undefined);
  const errorMsg =
    (claimM.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    "Gagal claim pickup.";

  const onClaim = async () => {
    if (!Number.isFinite(pickupId)) return;
    await claimM.mutateAsync(pickupId);
    setOpen(false);
  };

  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-semibold text-base line-clamp-1">{customerName}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{address}</p>
          <p className="text-xs text-muted-foreground">Request: {createdAt}</p>
        </div>

        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? "Tutup" : "Detail"}
        </Button>
      </div>

      {open ? (
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-muted-foreground">Alamat</p>
            <p className="font-medium">{address}</p>
            <p className="mt-2 text-muted-foreground">Waktu request</p>
            <p className="font-medium">{createdAt}</p>
          </div>

          <Button
            className="w-full"
            disabled={disabled || claimM.isPending || !Number.isFinite(pickupId)}
            onClick={onClaim}
          >
            {claimM.isPending ? "Memproses..." : "Pickup"}
          </Button>

          {claimM.isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700">
              {errorMsg}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
