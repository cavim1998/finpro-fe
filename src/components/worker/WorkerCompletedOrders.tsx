"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useWorkerStationOrdersQuery,
} from "@/hooks/api/useWorkerStations";
import { useDebounce } from "@/hooks/use-debunce";
import type { StationType } from "@/types";
import { Loader2 } from "lucide-react";
import WorkerCompletedOrderRow from "./completed-orders/WorkerCompletedOrderRow";
import WorkerCompletedOrdersFilters from "./completed-orders/WorkerCompletedOrdersFilters";
import WorkerCompletedOrdersPagination from "./completed-orders/WorkerCompletedOrdersPagination";
import { getStationTheme, isInDateRange } from "./completed-orders/shared";

type Props = {
  station: StationType;
  outletId: number;
  scope?: "incoming" | "my" | "completed";
  title: string;
  subtitle?: string;
};

export default function WorkerCompletedOrders({
  station,
  outletId,
  scope = "completed",
  title,
  subtitle,
}: Props) {
  const [page, setPage] = React.useState(1);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
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

    return items
      .filter((item) => {
        const matchesSearch =
          !search ||
          item.orderId.toLowerCase().includes(search) ||
          item.orderNo.toLowerCase().includes(search);
        const matchesDate =
          (!startDate && !endDate) || isInDateRange(item.enteredAt, startDate, endDate);

        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        const left = new Date(a.enteredAt).getTime();
        const right = new Date(b.enteredAt).getTime();

        if (Number.isNaN(left) || Number.isNaN(right)) return 0;
        return sortOrder === "asc" ? left - right : right - left;
      });
  }, [endDate, ordersQ.data, search, sortOrder, startDate]);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / limit));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice((currentPage - 1) * limit, currentPage * limit);
  const hasNextPage = currentPage < totalPages;
  const emptyText = getEmptyText(scope);
  const errorText = getErrorText(scope);
  const theme = getStationTheme(station);
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
  const onToggleSort = () => {
    setPage(1);
    setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24 space-y-4">
      <Card className={`rounded-2xl border ${theme.borderClass} ${theme.hoverShadowClass}`}>
        <CardHeader>
          <CardTitle className={`text-lg ${theme.textClass}`}>{title}</CardTitle>
          {subtitle ? <div className="text-sm text-muted-foreground">{subtitle}</div> : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <WorkerCompletedOrdersFilters
            theme={theme}
            searchInput={searchInput}
            draftStartDate={draftStartDate}
            draftEndDate={draftEndDate}
            sortOrder={sortOrder}
            disabled={ordersQ.isFetching}
            onSearchChange={setSearchInput}
            onDraftStartDateChange={setDraftStartDate}
            onDraftEndDateChange={setDraftEndDate}
            onApplyFilters={onApplyFilters}
            onResetFilters={onResetFilters}
            onToggleSort={onToggleSort}
          />

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
                <WorkerCompletedOrderRow key={it.orderStationId} station={station} item={it} />
              ))}
            </div>
          )}

          <WorkerCompletedOrdersPagination
            theme={theme}
            currentPage={currentPage}
            hasNextPage={hasNextPage}
            disabled={ordersQ.isFetching}
            onPrev={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() => setPage((current) => current + 1)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function getEmptyText(scope: Props["scope"]) {
  if (scope === "incoming") return "Belum ada incoming order untuk outlet ini.";
  if (scope === "my") return "Belum ada order aktif yang kamu kerjakan.";
  return "Belum ada order yang selesai dikerjakan.";
}

function getErrorText(scope: Props["scope"]) {
  if (scope === "incoming") return "Gagal memuat incoming order.";
  if (scope === "my") return "Gagal memuat order aktif.";
  return "Gagal memuat data order selesai.";
}
