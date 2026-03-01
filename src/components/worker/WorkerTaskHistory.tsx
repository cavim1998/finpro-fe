"use client";

import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useWorkerTaskHistoryQuery,
  type WorkerTaskHistoryItem,
} from "@/hooks/api/useWorkerTaskHistory";
import { useDebounce } from "@/hooks/use-debunce";
import { Loader2, Search } from "lucide-react";

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatus(item: WorkerTaskHistoryItem) {
  return item.stationStatus || item.status || "COMPLETED";
}

function getCustomerName(item: WorkerTaskHistoryItem) {
  return item.customerName || item.customer?.fullName || item.customer?.name || "-";
}

function getOrderNumber(item: WorkerTaskHistoryItem) {
  return item.orderNo || item.orderNumber || item.orderId || "-";
}

function getPrimaryTimestamp(item: WorkerTaskHistoryItem) {
  return (
    item.completedAt ||
    item.taskDate ||
    item.updatedAt ||
    item.startedAt ||
    item.enteredAt ||
    item.createdAt ||
    null
  );
}

function getDetailHref(item: WorkerTaskHistoryItem, stationPath: string) {
  if (!item.orderId) return null;

  return `${stationPath}/history/order/${encodeURIComponent(item.orderId)}`;
}

function HistoryRow({
  item,
  stationPath,
}: {
  item: WorkerTaskHistoryItem;
  stationPath: string;
}) {
  const detailHref = getDetailHref(item, stationPath);

  return (
    <div className="rounded-2xl border border-green-200 p-3 transition-shadow hover:shadow-[0_16px_36px_rgba(34,197,94,0.14)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold text-green-600">
            #{getOrderNumber(item)} • {getCustomerName(item)}
          </div>
          <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            <div>Status: {getStatus(item)}</div>
            <div>Waktu: {formatDateTime(getPrimaryTimestamp(item))}</div>
          </div>
        </div>

        {detailHref ? (
          <Button
            asChild
            size="sm"
            variant="outline"
            className="shrink-0 rounded-xl border-green-200 text-green-600 hover:bg-green-50"
          >
            <Link href={detailHref}>Detail</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

type Props = {
  outletStaffId: number;
  stationPath: "/worker/washing" | "/worker/ironing" | "/worker/packing";
  title?: string;
  subtitle?: string;
};

export default function WorkerTaskHistory({
  outletStaffId,
  stationPath,
  title = "Task History",
  subtitle = "Semua riwayat task yang pernah dikerjakan oleh worker ini.",
}: Props) {
  const [page, setPage] = React.useState(1);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [draftStartDate, setDraftStartDate] = React.useState("");
  const [draftEndDate, setDraftEndDate] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const search = useDebounce(searchInput.trim(), 400);
  const limit = 5;

  React.useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate]);

  const historyQ = useWorkerTaskHistoryQuery(
    {
      outletStaffId,
      page,
      limit,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      search: search || undefined,
    },
    { enabled: outletStaffId > 0 },
  );

  const items = React.useMemo(() => {
    const rows = [...(historyQ.data?.items ?? [])];

    return rows.sort((a, b) => {
      const left = new Date(getPrimaryTimestamp(a) ?? "").getTime();
      const right = new Date(getPrimaryTimestamp(b) ?? "").getTime();

      if (Number.isNaN(left) || Number.isNaN(right)) return 0;
      return sortOrder === "asc" ? left - right : right - left;
    });
  }, [historyQ.data?.items, sortOrder]);
  const totalPages = Number(historyQ.data?.pagination?.totalPages ?? 0);
  const canNext = totalPages > 0 ? page < totalPages : items.length === limit;

  const onApplyFilters = () => {
    setPage(1);
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
  };

  const onResetFilters = () => {
    setPage(1);
    setDraftStartDate("");
    setDraftEndDate("");
    setStartDate("");
    setEndDate("");
    setSearchInput("");
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <Card className="rounded-2xl border border-green-200 transition-shadow hover:shadow-[0_16px_36px_rgba(34,197,94,0.14)]">
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg text-green-600">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
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
              onClick={onApplyFilters}
              disabled={historyQ.isFetching}
              className="bg-green-50 text-green-700 hover:bg-green-100"
            >
              Terapkan Filter
            </Button>
            <Button
              variant="outline"
              onClick={onResetFilters}
              disabled={historyQ.isFetching}
              className="border-green-200 text-green-600 hover:bg-green-50"
            >
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPage(1);
                setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
              }}
              disabled={historyQ.isFetching}
              className="border-green-200 text-green-600 hover:bg-green-50"
            >
              Sort: {sortOrder === "asc" ? "Terlama" : "Terbaru"}
            </Button>
          </div>

          {historyQ.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat riwayat task...
            </div>
          ) : historyQ.isError ? (
            <div className="text-sm text-destructive">Gagal memuat riwayat task worker.</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Tidak ada history yang cocok dengan filter saat ini.
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <HistoryRow
                  key={String(item.id ?? item.orderStationId ?? item.orderId ?? `${page}-${index}`)}
                  item={item}
                  stationPath={stationPath}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="border-green-200 text-green-600 hover:bg-green-50"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || historyQ.isFetching}
            >
              Prev
            </Button>
            <p className="text-xs text-muted-foreground">Page {page}</p>
            <Button
              variant="outline"
              size="sm"
              className="border-green-200 text-green-600 hover:bg-green-50"
              onClick={() => setPage((current) => current + 1)}
              disabled={!canNext || historyQ.isFetching}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
