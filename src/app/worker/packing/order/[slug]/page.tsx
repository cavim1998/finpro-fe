"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  useBypassWorkerOrderMutation,
  useCompleteWorkerOrderMutation,
  useWorkerOrderDetailQuery,
} from "@/hooks/api/useWorkerStations";
import { ArrowLeft, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

function formatDateTime(iso?: string) {
  if (!iso) return "-";
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

function formatStatus(status?: string) {
  if (!status) return "-";
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

type ItemCounter = {
  itemId: number;
  name: string;
  expectedQty: number;
  actualQty: number;
};

export default function WorkerPackingOrderDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const slug = params?.slug;
  const orderId = Array.isArray(slug) ? slug[0] : slug;
  const isReadOnly = searchParams.get("readonly") === "1";
  const from = searchParams.get("from");
  const backHref = isReadOnly && from === "orders" ? "/worker/packing/orders" : "/worker/packing";

  const orderQ = useWorkerOrderDetailQuery(orderId ?? "", { enabled: !!orderId });
  const completeM = useCompleteWorkerOrderMutation();
  const bypassM = useBypassWorkerOrderMutation();

  const [counts, setCounts] = React.useState<Record<number, number>>({});
  const [reason, setReason] = React.useState("");

  const order = orderQ.data;

  const items: ItemCounter[] = React.useMemo(() => {
    const rows = order?.items ?? [];
    return rows
      .map((it, idx) => {
        const itemId = Number(it.itemId ?? it.item?.id);
        if (!Number.isFinite(itemId)) return null;

        return {
          itemId,
          name: it.item?.name || it.name || `Item ${idx + 1}`,
          expectedQty: Math.max(0, Number(it.qty ?? 0)),
          actualQty: 0,
        };
      })
      .filter((v): v is ItemCounter => v !== null);
  }, [order?.items]);

  React.useEffect(() => {
    if (items.length === 0) return;
    setCounts((prev) => {
      const next: Record<number, number> = {};
      for (const it of items) {
        const existing = prev[it.itemId];
        next[it.itemId] = Number.isFinite(existing) ? Math.max(0, existing) : it.expectedQty;
      }
      return next;
    });
  }, [items]);

  const hydratedItems = React.useMemo(() => {
    return items.map((it) => ({
      ...it,
      actualQty: Math.max(0, Number(counts[it.itemId] ?? 0)),
    }));
  }, [items, counts]);

  const isMatched = hydratedItems.every((it) => it.actualQty === it.expectedQty);
  const hasAnyItem = hydratedItems.length > 0;
  const hasInvalidItemId = (order?.items?.length ?? 0) > hydratedItems.length;

  const customerName =
    order?.customer?.fullName ||
    order?.customer?.name ||
    order?.customer?.email ||
    "Pelanggan";

  const orderLabel = order?.orderNo || order?.orderNumber || order?.id || orderId || "-";

  const setQty = (itemId: number, value: number) => {
    setCounts((prev) => ({ ...prev, [itemId]: Math.max(0, value) }));
  };

  const actionLoading = completeM.isPending || bypassM.isPending;

  const onSubmit = async () => {
    if (isReadOnly) return;
    if (!orderId || !hasAnyItem) return;

    if (hasInvalidItemId) {
      toast.error("Ada item yang tidak memiliki itemId valid.");
      return;
    }

    const itemCounts = hydratedItems.map((it) => ({ itemId: it.itemId, qty: it.actualQty }));

    try {
      if (isMatched) {
        await completeM.mutateAsync({
          stationType: "PACKING",
          orderId,
          itemCounts,
        });
        toast.success("Pekerjaan berhasil diselesaikan.");
        router.push("/worker/packing");
        return;
      }

      if (!reason.trim()) {
        toast.error("Alasan bypass wajib diisi.");
        return;
      }

      await bypassM.mutateAsync({
        stationType: "PACKING",
        orderId,
        reason: reason.trim(),
        itemCounts,
      });
      toast.success("Request ke outlet admin berhasil dikirim.");
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Aksi gagal diproses.";
      toast.error(message);
    }
  };

  return (
    <RequireCheckInRQ
      roles={["WORKER"]}
      redirectTo={orderId ? `/attendance?next=/worker/packing/order/${orderId}` : "/attendance?next=/worker/packing"}
    >
      <div className="border-b-1">
        <NavbarWorker />
      </div>

      <div className="container mx-auto px-4 py-6 pb-24 space-y-4">
        <Button asChild variant="ghost" className="gap-2">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        </Button>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Detail Order</CardTitle>
          </CardHeader>
          <CardContent>
            {orderQ.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading detail order...
              </div>
            ) : orderQ.isError ? (
              <div className="text-sm text-destructive">Gagal memuat detail order.</div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border p-4">
                  <div className="text-lg font-semibold">#{orderLabel}</div>
                  <div className="text-sm text-muted-foreground mt-1">{customerName}</div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Status Order</div>
                      <div className="font-medium">{formatStatus(order?.status)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Outlet</div>
                      <div className="font-medium">{order?.outlet?.name ?? "-"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Dibuat</div>
                      <div className="font-medium">{formatDateTime(order?.createdAt)}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="font-semibold mb-2">Hitung Ulang Item</div>
                  {isReadOnly ? (
                    <div className="mb-3 text-sm text-muted-foreground">
                      Mode detail read-only. Aksi perubahan dinonaktifkan.
                    </div>
                  ) : null}
                  {hasInvalidItemId ? (
                    <div className="mb-3 text-sm text-destructive">
                      Beberapa item tidak punya `itemId` valid dari backend, jadi belum bisa submit.
                    </div>
                  ) : null}

                  {hydratedItems.length > 0 ? (
                    <div className="space-y-2">
                      {hydratedItems.map((it) => {
                        const matched = it.actualQty === it.expectedQty;
                        return (
                          <div
                            key={`${it.itemId}-${it.name}`}
                            className="rounded-lg border px-3 py-2 text-sm"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-medium truncate">{it.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  Qty order: {it.expectedQty}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon-sm"
                                  onClick={() => setQty(it.itemId, it.actualQty - 1)}
                                  disabled={isReadOnly || actionLoading || it.actualQty <= 0}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>

                                <div className="w-10 text-center font-semibold">{it.actualQty}</div>

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon-sm"
                                  onClick={() => setQty(it.itemId, it.actualQty + 1)}
                                  disabled={isReadOnly || actionLoading}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="mt-2 text-xs">
                              {matched ? (
                                <span className="text-emerald-600">Qty sesuai</span>
                              ) : (
                                <span className="text-amber-600">Qty belum sesuai</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Belum ada data item.</div>
                  )}
                </div>

                {!isReadOnly && !isMatched ? (
                  <div className="rounded-xl border p-4 space-y-2">
                    <div className="text-sm font-medium">Alasan Request ke Outlet Admin</div>
                    <Textarea
                      placeholder="Contoh: ada pakaian rusak / item tidak ditemukan / qty berbeda"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      disabled={actionLoading}
                    />
                  </div>
                ) : null}

                {!isReadOnly ? (
                  <Button
                    className="w-full rounded-xl"
                    onClick={onSubmit}
                    disabled={
                      actionLoading ||
                      !hasAnyItem ||
                      hasInvalidItemId ||
                      (!isMatched && !reason.trim())
                    }
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
                      </>
                    ) : isMatched ? (
                      "Selesaikan pekerjaan"
                    ) : (
                      "Request ke outlet admin"
                    )}
                  </Button>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav role="WORKER" workerHomePath="/worker/packing" />
    </RequireCheckInRQ>
  );
}
