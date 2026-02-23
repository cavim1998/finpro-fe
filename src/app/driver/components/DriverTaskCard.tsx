"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  task: unknown;
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

export default function DriverTaskCard({ task, disabled }: Props) {
  const t = getObj(task);
  const taskIdRaw = t.id;
  const taskId = Number(taskIdRaw);
  const status = String(t.status ?? "-");

  const pickupRequest = getObj(t.pickupRequest);
  const customer = getObj(pickupRequest.customer);
  const profile = getObj(customer.profile);

  const customerName =
    String(profile.fullName ?? profile.name ?? pickupRequest.customerName ?? customer.email ?? "Pelanggan");
  const createdAt = formatDateTime((pickupRequest.createdAt as string | undefined) ?? undefined);

  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-semibold text-base line-clamp-1">{customerName}</p>
          <p className="text-xs text-muted-foreground">
            Status: <span className="font-medium">{status}</span>
          </p>
          <p className="text-xs text-muted-foreground">Request: {createdAt}</p>
        </div>

        <Button asChild variant="outline" size="sm" disabled={disabled || !Number.isFinite(taskId)}>
          <Link href={`/driver/order/${taskId}?type=task`}>Detail</Link>
        </Button>
      </div>
    </div>
  );
}
