"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  useBypassWorkerOrderMutation,
  useCompleteWorkerOrderMutation,
} from "@/hooks/api/useWorkerStations";
import type { StationType } from "@/types";
import type { ItemCounter } from "./shared";

type Params = {
  station: StationType;
  stationPath: "/worker/washing" | "/worker/ironing" | "/worker/packing";
  historyMode: boolean;
  isReadOnly: boolean;
  orderId?: string;
  order: {
    status?: string;
    createdAt?: string;
    orderNo?: string;
    orderNumber?: string;
    id?: string;
    outlet?: { name?: string | null };
    customer?: { fullName?: string; name?: string; email?: string };
    items?: Array<{
      itemId?: number | string | null;
      qty?: number | string | null;
      name?: string;
      item?: { id?: number | string | null; name?: string };
    }>;
    stations?: Array<{ stationType?: StationType; status?: string }>;
  } | null | undefined;
  refetchOrder: () => Promise<unknown>;
  navigatePush: (href: string) => void;
  navigateReplace: (href: string) => void;
};

export default function useWorkerOrderDetailState({
  station,
  stationPath,
  historyMode,
  isReadOnly,
  orderId,
  order,
  refetchOrder,
  navigatePush,
  navigateReplace,
}: Params) {
  const completeM = useCompleteWorkerOrderMutation();
  const bypassM = useBypassWorkerOrderMutation();
  const [counts, setCounts] = React.useState<Record<number, number>>({});
  const [reason, setReason] = React.useState("");
  const [bypassRequested, setBypassRequested] = React.useState(false);
  const lastBypassStateRef = React.useRef<string | null>(null);

  const currentStation = React.useMemo(
    () => order?.stations?.find((item) => item.stationType === station),
    [order?.stations, station],
  );
  const currentStationStatus = currentStation?.status;

  const items: ItemCounter[] = React.useMemo(() => {
    const rows = order?.items ?? [];

    return rows
      .map((item, index) => {
        const itemId = Number(item.itemId ?? item.item?.id);
        if (!Number.isFinite(itemId)) return null;

        return {
          itemId,
          name: item.item?.name || item.name || `Item ${index + 1}`,
          expectedQty: Math.max(0, Number(item.qty ?? 0)),
          actualQty: 0,
        };
      })
      .filter((value): value is ItemCounter => value !== null);
  }, [order?.items]);

  React.useEffect(() => {
    if (items.length === 0) return;

    setCounts((previous) => {
      const next: Record<number, number> = {};

      for (const item of items) {
        const existing = previous[item.itemId];
        next[item.itemId] = Number.isFinite(existing) ? Math.max(0, existing) : item.expectedQty;
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
    order?.customer?.fullName || order?.customer?.name || order?.customer?.email || "Pelanggan";
  const orderLabel = order?.orderNo || order?.orderNumber || order?.id || orderId || "-";
  const actionLoading = completeM.isPending || bypassM.isPending;

  React.useEffect(() => {
    if (historyMode) return;

    if (isWaitingBypass) {
      setBypassRequested(true);
      return;
    }

    if (currentStationStatus === "IN_PROGRESS") {
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
      navigateReplace(stationPath);
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
  }, [currentStationStatus, historyMode, navigateReplace, stationPath]);

  const setQty = (itemId: number, value: number) => {
    setCounts((previous) => ({ ...previous, [itemId]: Math.max(0, value) }));
  };

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
        navigatePush(stationPath);
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
      await refetchOrder();
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

  return {
    actionLoading,
    customerName,
    hasAnyItem,
    hasInvalidItemId,
    hydratedItems,
    isBypassLocked,
    isMatched,
    orderLabel,
    reason,
    setQty,
    setReason,
    onSubmit,
    refetchInterval: !historyMode && bypassRequested ? 3_000 : null,
  };
}
