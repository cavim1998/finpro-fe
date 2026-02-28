"use client";

import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useWorkerStationOrdersQuery,
  type WorkerOrderListItem,
} from "@/hooks/api/useWorkerStations";
import { useDebounce } from "@/hooks/use-debunce";
import type { StationType } from "@/types";
import { Loader2, Search } from "lucide-react";

function formatEnteredAt(iso: string) {
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

function formatDateInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isInDateRange(iso: string, startDate?: string, endDate?: string) {
  const value = formatDateInput(iso);
  if (!value) return false;
  if (startDate && value < startDate) return false;
  if (endDate && value > endDate) return false;
  return true;
}

type Props = {
  station: StationType;
  outletId: number;
  scope?: "incoming" | "my" | "completed";
  title: string;
  subtitle?: string;
};

function getStationTheme(station: StationType) {
  if (station === "WASHING") {
    return {
      textClass: "text-blue-500",
      borderClass: "border-blue-200",
      hoverShadowClass: "hover:shadow-[0_16px_36px_rgba(59,130,246,0.14)]",
      softBgClass: "bg-blue-50/70",
      solidButtonClass: "bg-blue-50 text-blue-700 hover:bg-blue-100",
      ghostButtonClass: "border-blue-200 text-blue-600 hover:bg-blue-50",
    };
  }

  if (station === "IRONING") {
    return {
      textClass: "text-red-500",
      borderClass: "border-red-200",
      hoverShadowClass: "hover:shadow-[0_16px_36px_rgba(239,68,68,0.14)]",
      softBgClass: "bg-red-50/70",
      solidButtonClass: "bg-red-50 text-red-700 hover:bg-red-100",
      ghostButtonClass: "border-red-200 text-red-600 hover:bg-red-50",
    };
  }

  return {
    textClass: "text-[#1DACBC]",
    borderClass: "border-[#1DACBC]/30",
    hoverShadowClass: "hover:shadow-[0_16px_36px_rgba(29,172,188,0.14)]",
    softBgClass: "bg-[#1DACBC]/5",
    solidButtonClass: "bg-[#1DACBC]/10 text-[#138A96] hover:bg-[#1DACBC]/15",
    ghostButtonClass: "border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5",
  };
}

function CompletedRow({ station, item }: { station: StationType; item: WorkerOrderListItem }) {
  const totalKg = typeof item.totalKg === "string" ? Number(item.totalKg) : item.totalKg;
  const theme = getStationTheme(station);

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-2xl border p-2.5 py-3 transition-shadow ${theme.borderClass} ${theme.hoverShadowClass}`}
    >
      <div className="min-w-0">
        <div className={`truncate font-semibold ${theme.textClass}`}>
          #{item.orderNo} • {item.customerName}
        </div>
        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
          <div>Jumlah pakaian: {item.clothesCount}</div>
          <div>Total: {Number.isFinite(totalKg) ? totalKg : item.totalKg} kg</div>
          <div>Masuk: {formatEnteredAt(item.enteredAt)}</div>
          <div>Status: {item.stationStatus}</div>
        </div>
      </div>

      <Button
        asChild
        size="sm"
        variant="outline"
        className={`shrink-0 rounded-xl ${theme.ghostButtonClass}`}
      >
        <Link
          href={`/worker/${station.toLowerCase()}/order/${encodeURIComponent(item.orderId)}?readonly=1&from=orders`}
        >
          Detail
        </Link>
      </Button>
    </div>
  );
}

export default function WorkerCompletedOrders({
  station,
  outletId,
  scope = "completed",
  title,
  subtitle,
}: Props) {
  const [page, setPage] = React.useState(1);
  const [draftStartDate, setDraftStartDate] = React.useState("");
  const [draftEndDate, setDraftEndDate] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const search = useDebounce(searchInput.trim().toLowerCase(), 400);
  const limit = 5;
  const fetchLimit = 50;

  const ordersQ = useWorkerStationOrdersQuery(station, scope, {
    enabled: outletId > 0,
    outletId,
    page: 1,
    limit: fetchLimit,
  });

  React.useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate]);

  const filteredItems = React.useMemo(() => {
    const items = ordersQ.data ?? [];

    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.orderId.toLowerCase().includes(search) ||
        item.orderNo.toLowerCase().includes(search);
      const matchesDate =
        (!startDate && !endDate) || isInDateRange(item.enteredAt, startDate, endDate);

      return matchesSearch && matchesDate;
    });
  }, [endDate, ordersQ.data, search, startDate]);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / limit));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice((currentPage - 1) * limit, currentPage * limit);
  const hasNextPage = currentPage < totalPages;
  const emptyText =
    scope === "incoming"
      ? "Belum ada incoming order untuk outlet ini."
      : scope === "my"
        ? "Belum ada order aktif yang kamu kerjakan."
        : "Belum ada order yang selesai dikerjakan.";
  const errorText =
    scope === "incoming"
      ? "Gagal memuat incoming order."
      : scope === "my"
        ? "Gagal memuat order aktif."
        : "Gagal memuat data order selesai.";
  const theme = getStationTheme(station);

  return (
    <div className="container mx-auto px-4 py-6 pb-24 space-y-4">
      <Card className={`rounded-2xl border ${theme.borderClass} ${theme.hoverShadowClass}`}>
        <CardHeader>
          <CardTitle className={`text-lg ${theme.textClass}`}>{title}</CardTitle>
          {subtitle ? <div className="text-sm text-muted-foreground">{subtitle}</div> : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari berdasarkan Order ID"
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Start Date</p>
              <Input
                type="date"
                value={draftStartDate}
                onChange={(e) => setDraftStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">End Date</p>
              <Input
                type="date"
                value={draftEndDate}
                onChange={(e) => setDraftEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              className={theme.solidButtonClass}
              onClick={() => {
                setPage(1);
                setStartDate(draftStartDate);
                setEndDate(draftEndDate);
              }}
              disabled={ordersQ.isFetching}
            >
              Terapkan Filter
            </Button>
            <Button
              variant="outline"
              className={theme.ghostButtonClass}
              onClick={() => {
                setPage(1);
                setDraftStartDate("");
                setDraftEndDate("");
                setStartDate("");
                setEndDate("");
                setSearchInput("");
              }}
              disabled={ordersQ.isFetching}
            >
              Reset
            </Button>
          </div>

          {ordersQ.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : ordersQ.isError ? (
            <div className="text-sm text-destructive">{errorText}</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">{emptyText}</div>
          ) : (
            <div className="space-y-2">
              {paginatedItems.map((it) => (
                <CompletedRow key={it.orderStationId} station={station} item={it} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <Button
              size="sm"
              variant="outline"
              className={theme.ghostButtonClass}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || ordersQ.isFetching}
            >
              Prev
            </Button>

            <div className="text-xs text-muted-foreground">Page {currentPage}</div>

            <Button
              size="sm"
              variant="outline"
              className={theme.ghostButtonClass}
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage || ordersQ.isFetching}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
