"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import type { DriverDashboardParams } from "@/features/driver/driver.api";
import { useClaimPickupMutation } from "@/features/driver/driver.hooks";

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

function getCustomerName(p: any) {
  const prof = p?.customerProfile || p?.customer?.profile;
  return (
    prof?.fullName ||
    prof?.name ||
    p?.customerName ||
    p?.customer?.email ||
    "Pelanggan"
  );
}

function getAddressText(pickup: any) {
  const addr =
    pickup?.address ??
    pickup?.customerAddress ??
    pickup?.customer_address ??
    pickup?.addressText;

  if (typeof addr === "string") return addr;

  return String(
    addr?.addressText ||
      addr?.label ||
      addr?.receiverName ||
      addr?.receiverPhone ||
      "-",
  );
}

type Props = {
  pickup: any;
  dashboardParams: DriverDashboardParams;
  disabled?: boolean;
};

export default function DriverPickupRequestCard({
  pickup,
  dashboardParams,
  disabled,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const claimM = useClaimPickupMutation(dashboardParams);

  const pickupId = Number(pickup?.id);
  const customerName = getCustomerName(pickup);
  const address = getAddressText(pickup);
  const createdAt = formatDateTime(pickup?.createdAt);

  const onClaim = async () => {
    if (!Number.isFinite(pickupId)) return;
    await claimM.mutateAsync(pickupId);
    setOpen(false); // optional: tutup setelah sukses
  };

  const errorMsg =
    (claimM.error as any)?.response?.data?.message ??
    (claimM.error as any)?.message ??
    null;

  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-base line-clamp-1">{customerName}</p>

        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? "Tutup" : "Detail"}
        </Button>
      </div>

      {open && (
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

          {claimM.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700">
              {errorMsg ?? "Gagal claim pickup."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}