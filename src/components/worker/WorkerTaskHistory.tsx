"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkerTaskHistoryQuery } from "@/hooks/api/useWorkerTaskHistory";
import { useDebounce } from "@/hooks/use-debunce";
import { Loader2 } from "lucide-react";
import WorkerTaskHistoryFilters from "./task-history/WorkerTaskHistoryFilters";
import WorkerTaskHistoryPagination from "./task-history/WorkerTaskHistoryPagination";
import WorkerTaskHistoryRow from "./task-history/WorkerTaskHistoryRow";
import { getPrimaryTimestamp } from "./task-history/shared";

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
          <WorkerTaskHistoryFilters
            searchInput={searchInput}
            draftStartDate={draftStartDate}
            draftEndDate={draftEndDate}
            sortOrder={sortOrder}
            disabled={historyQ.isFetching}
            onSearchChange={setSearchInput}
            onDraftStartDateChange={setDraftStartDate}
            onDraftEndDateChange={setDraftEndDate}
            onApplyFilters={onApplyFilters}
            onResetFilters={onResetFilters}
            onToggleSort={() => {
              setPage(1);
              setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
            }}
          />

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
                <WorkerTaskHistoryRow
                  key={String(item.id ?? item.orderStationId ?? item.orderId ?? `${page}-${index}`)}
                  item={item}
                  stationPath={stationPath}
                />
              ))}
            </div>
          )}

          <WorkerTaskHistoryPagination
            page={page}
            canNext={canNext}
            disabled={historyQ.isFetching}
            onPrev={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() => setPage((current) => current + 1)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
