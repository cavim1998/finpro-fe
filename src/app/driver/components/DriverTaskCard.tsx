"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

import type { DriverDashboardParams } from "@/features/driver/driver.api";
import {
  useStartTaskMutation,
  usePickupPickedUpMutation,
  usePickupArrivedMutation,
} from "@/features/driver/driver.hooks";

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

function getCustomerName(task: any) {
  const pr = task?.pickupRequest;
  const prof = pr?.customerProfile || pr?.customer?.profile;
  return (
    prof?.fullName ||
    prof?.name ||
    pr?.customerName ||
    pr?.customer?.email ||
    "Pelanggan"
  );
}

function getAddressText(task: any) {
  const pr = task?.pickupRequest;
  const a = pr?.address;
  return (
    pr?.addressText ||
    a?.addressText ||
    (typeof a === "string" ? a : null) ||
    "-"
  );
}

type Props = {
  task: any; // DriverTask dari dashboard
  dashboardParams: DriverDashboardParams; // penting untuk invalidate dashboard query
  disabled?: boolean;
};

export default function DriverTaskCard({ task, dashboardParams, disabled }: Props) {
  const [open, setOpen] = React.useState(false);

  const startTaskM = useStartTaskMutation(dashboardParams);
  const pickedUpM = usePickupPickedUpMutation(dashboardParams);
  const arrivedM = usePickupArrivedMutation(dashboardParams);

  const taskId = Number(task?.id);
  const status = (task?.status ?? "") as
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "DONE"
    | string;

  const customerName = getCustomerName(task);
  const addressText = getAddressText(task);
  const createdAt = formatDateTime(task?.pickupRequest?.createdAt);

  const action =
    status === "ASSIGNED"
      ? { label: "OTW Outlet", run: () => startTaskM.mutateAsync(taskId) }
      : status === "IN_PROGRESS"
        ? { label: "Arrived at Outlet", run: () => arrivedM.mutateAsync(taskId) }
        : null;

  const isPending = startTaskM.isPending || pickedUpM.isPending || arrivedM.isPending;

  const errorMsg =
    ((startTaskM.error as any)?.response?.data?.message ??
      (pickedUpM.error as any)?.response?.data?.message ??
      (arrivedM.error as any)?.response?.data?.message) ||
    null;

  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-base line-clamp-1">{customerName}</p>
          <p className="text-xs text-muted-foreground">
            Status: <span className="font-medium">{status}</span>
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Tutup" : "Detail"}
        </Button>
      </div>

      {open && (
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-muted-foreground">Alamat</p>
            <p className="font-medium">{addressText}</p>

            <p className="mt-2 text-muted-foreground">Waktu request</p>
            <p className="font-medium">{createdAt}</p>
          </div>

          {action ? (
            <Button
              className="w-full"
              disabled={disabled || isPending || !Number.isFinite(taskId)}
              onClick={async () => {
                await action.run();
                // invalidate dashboard otomatis dari hook -> list update
                setOpen(false);
              }}
            >
              {isPending ? "Memproses..." : action.label}
            </Button>
          ) : (
            <Button className="w-full" disabled variant="secondary">
              Tidak ada aksi
            </Button>
          )}

          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700">
              {errorMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}