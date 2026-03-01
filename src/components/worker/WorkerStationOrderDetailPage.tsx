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
import { useProfileQuery } from "@/hooks/api/useProfile";
import {
  useBypassWorkerOrderMutation,
  useCompleteWorkerOrderMutation,
  useWorkerOrderDetailQuery,
} from "@/hooks/api/useWorkerStations";
import type { StationType } from "@/types";
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

function getOutletStaffId(profile: unknown): number | null {
  const data = (profile ?? {}) as {
    outletStaffId?: number | string | null;
    outletStaff?: { id?: number | string | null };
    staff?: { id?: number | string | null };
  };

  const value =
    data.outletStaffId ??
    data.outletStaff?.id ??
    data.staff?.id ??
    null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

type ItemCounter = {
  itemId: number;
  name: string;
  expectedQty: number;
  actualQty: number;
};

type Props = {
  station: StationType;
  stationPath: "/worker/washing" | "/worker/ironing" | "/worker/packing";
  historyMode?: boolean;
};

export default function WorkerStationOrderDetailPage({
  station,
  stationPath,
  historyMode = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ slug?: string; orderId?: string }>();
  const profileQ = useProfileQuery();
  const routeValue = params?.orderId ?? params?.slug;
  const orderId = Array.isArray(routeValue) ? routeValue[0] : routeValue;
  const isReadOnly = historyMode || searchParams.get("readonly") === "1";
  const from = searchParams.get("from");
  const historyOutletStaffId = getOutletStaffId(profileQ.data);
  const backHref = historyMode
    ? historyOutletStaffId
      ? `${stationPath}/history/${historyOutletStaffId}`
      : `${stationPath}/history`
    : isReadOnly && from === "orders"
      ? `${stationPath}/orders`
      : stationPath;
  const [bypassRequested, setBypassRequested] = React.useState(false);
  const lastBypassStateRef = React.useRef<string | null>(null);

  const orderQ = useWorkerOrderDetailQuery(orderId ?? "", {
    enabled: !!orderId,
    refetchInterval: !historyMode && bypassRequested ? 3_000 : false,
  });
  const completeM = useCompleteWorkerOrderMutation();
  const bypassM = useBypassWorkerOrderMutation();

  const [counts, setCounts] = React.useState<Record<number, number>>({});
  const [reason, setReason] = React.useState("");

  const order = orderQ.data;
  const currentStation = React.useMemo(
    () => order?.stations?.find((item) => item.stationType === station),
    [order?.stations, station],
  );
  const currentStationStatus = currentStation?.status;

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
      .filter((value): value is ItemCounter => value !== null);
  }, [order?.items]);

  React.useEffect(() => {
    if (items.length === 0) return;
    setCounts((prev) => {
      const next: Record<number, number> = {};
      for (const item of items) {
        const existing = prev[item.itemId];
        next[item.itemId] = Number.isFinite(existing)
          ? Math.max(0, existing)
          : item.expectedQty;
      }
      return next;
    });
  }, [items]);

  const hydratedItems = React.useMemo(
    () =>
      items.map((item) => ({
        ...item,
        actualQty: Math.max(0, Number(counts[item.itemId] ?? 0)),
      })),
    [items, counts],
  );

  const isMatched = hydratedItems.every((item) => item.actualQty === item.expectedQty);
  const hasAnyItem = hydratedItems.length > 0;
  const hasInvalidItemId = (order?.items?.length ?? 0) > hydratedItems.length;
  const isWaitingBypass = currentStationStatus === "WAITING_BYPASS";
  const isBypassLocked = bypassRequested || isWaitingBypass;

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

  React.useEffect(() => {
    if (historyMode) return;

    if (isWaitingBypass) {
      setBypassRequested(true);
    } else if (currentStationStatus === "IN_PROGRESS") {
      setBypassRequested(false);
    }
  }, [currentStationStatus, historyMode, isWaitingBypass]);

  React.useEffect(() => {
    if (historyMode) return;

    const previous = lastBypassStateRef.current;

    if (
      (previous === "WAITING_BYPASS" || previous === "REQUESTED") &&
      currentStationStatus === "COMPLETED"
    ) {
      toast.success("Request bypass disetujui. Task selesai.");
      router.replace(stationPath);
      return;
    }

    if (
      (previous === "WAITING_BYPASS" || previous === "REQUESTED") &&
      currentStationStatus === "IN_PROGRESS"
    ) {
      toast.error("Request bypass ditolak. Silakan lanjutkan pekerjaan.");
      setBypassRequested(false);
    }

    lastBypassStateRef.current = currentStationStatus ?? null;
  }, [currentStationStatus, historyMode, router, stationPath]);

  const onSubmit = async () => {
    if (isReadOnly) return;
    if (!orderId || !hasAnyItem) return;
    if (isBypassLocked) return;

    if (hasInvalidItemId) {
      toast.error("Ada item yang tidak memiliki itemId valid.");
      return;
    }

    const itemCounts = hydratedItems.map((item) => ({ itemId: item.itemId, qty: item.actualQty }));

    try {
      if (isMatched) {
        await completeM.mutateAsync({
          stationType: station,
          orderId,
          itemCounts,
        });
        toast.success("Pekerjaan berhasil diselesaikan.");
        router.push(stationPath);
        return;
      }

      if (!reason.trim()) {
        toast.error("Alasan bypass wajib diisi.");
        return;
      }

      await bypassM.mutateAsync({
        stationType: station,
        orderId,
        reason: reason.trim(),
        itemCounts,
      });
      lastBypassStateRef.current = "REQUESTED";
      setBypassRequested(true);
      await orderQ.refetch();
      toast.success("Request ke outlet admin berhasil dikirim.");
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message ===
          "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Aksi gagal diproses.";
      toast.error(message);
    }
  };

  return (
    <RequireCheckInRQ
      roles={["WORKER"]}
      redirectTo={
        orderId
          ? `/attendance?next=${historyMode ? `${stationPath}/history/order/${orderId}` : `${stationPath}/order/${orderId}`}`
          : `/attendance?next=${stationPath}`
      }
    >
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="border-b-1">
          <NavbarWorker />
        </div>

        <div className="container mx-auto px-4 py-6 pb-24 space-y-4">
          <Button
            asChild
            variant="ghost"
            className="gap-2 text-[#1DACBC] hover:bg-[#1DACBC]/5 hover:text-[#138A96]"
          >
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Link>
          </Button>

          <Card className="rounded-2xl border border-[#1DACBC]/30 transition-shadow hover:shadow-[0_16px_36px_rgba(29,172,188,0.14)]">
            <CardHeader>
              <CardTitle className="text-lg text-[#1DACBC]">Detail Order</CardTitle>
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
                  <div className="rounded-xl border border-[#1DACBC]/20 p-4">
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

                  <div className="rounded-xl border border-[#1DACBC]/20 p-4">
                    <div className="mb-2 font-semibold text-[#138A96]">Hitung Ulang Item</div>
                    {isReadOnly ? (
                      <div className="mb-3 text-sm text-muted-foreground">
                        Mode detail read-only. Aksi perubahan dinonaktifkan.
                      </div>
                    ) : null}
                    {isBypassLocked ? (
                      <div className="mb-3 text-sm text-amber-700">
                        Request bypass sedang diproses. Perubahan item dikunci sampai admin memberi
                        keputusan.
                      </div>
                    ) : null}
                    {hasInvalidItemId ? (
                      <div className="mb-3 text-sm text-destructive">
                        Beberapa item tidak punya `itemId` valid dari backend, jadi belum bisa
                        submit.
                      </div>
                    ) : null}

                    {hydratedItems.length > 0 ? (
                      <div className="space-y-2">
                        {hydratedItems.map((item) => {
                          const matched = item.actualQty === item.expectedQty;
                          return (
                            <div
                              key={`${item.itemId}-${item.name}`}
                              className="rounded-lg border border-[#1DACBC]/15 px-3 py-2 text-sm transition-shadow hover:shadow-[0_12px_28px_rgba(29,172,188,0.1)]"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="truncate font-medium">{item.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Qty order: {item.expectedQty}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon-sm"
                                    className="border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5"
                                    onClick={() => setQty(item.itemId, item.actualQty - 1)}
                                    disabled={
                                      isReadOnly || isBypassLocked || actionLoading || item.actualQty <= 0
                                    }
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>

                                  <div className="w-10 text-center font-semibold">{item.actualQty}</div>

                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon-sm"
                                    className="border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5"
                                    onClick={() => setQty(item.itemId, item.actualQty + 1)}
                                    disabled={isReadOnly || isBypassLocked || actionLoading}
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
                    <div className="space-y-2 rounded-xl border border-[#1DACBC]/20 p-4">
                      <div className="text-sm font-medium text-[#138A96]">
                        Alasan Request ke Outlet Admin
                      </div>
                      <Textarea
                        className="border-[#1DACBC]/20 focus-visible:ring-[#1DACBC]/30"
                        placeholder="Contoh: ada pakaian rusak / item tidak ditemukan / qty berbeda"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={actionLoading || isBypassLocked}
                      />
                    </div>
                  ) : null}

                  {!isReadOnly ? (
                    <Button
                      className="w-full rounded-xl bg-[#1DACBC] text-white hover:bg-[#1697A5]"
                      onClick={onSubmit}
                      disabled={
                        isBypassLocked ||
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

        <BottomNav role="WORKER" workerHomePath={stationPath} />
      </div>
    </RequireCheckInRQ>
  );
}
