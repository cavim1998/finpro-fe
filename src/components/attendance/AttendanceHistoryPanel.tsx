"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AttendanceHistoryItem } from "@/hooks/api/useAttendanceHistory";
import { useAttendanceHistoryQuery } from "@/hooks/api/useAttendanceHistory";
import { Loader2 } from "lucide-react";

function formatDateInput(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: formatDateInput(start),
    endDate: formatDateInput(end),
  };
}

function parseDateInput(value?: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDatesInRange(startDate?: string, endDate?: string) {
  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate);
  if (!start || !end || start > end) return [];

  const dates: string[] = [];
  const cursor = new Date(end);

  while (cursor >= start) {
    dates.push(getDateKey(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }

  return dates;
}

function getTargetPageForDate(
  dates: string[],
  targetDate: string,
  pageSize: number,
) {
  const targetIndex = dates.indexOf(targetDate);
  if (targetIndex === -1) return 1;
  return Math.floor(targetIndex / pageSize) + 1;
}

function formatDate(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AttendanceHistoryPanel() {
  const monthDefaults = useMemo(() => getCurrentMonthRange(), []);
  const [draftStartDate, setDraftStartDate] = useState(monthDefaults.startDate);
  const [draftEndDate, setDraftEndDate] = useState(monthDefaults.endDate);
  const [startDate, setStartDate] = useState(monthDefaults.startDate);
  const [endDate, setEndDate] = useState(monthDefaults.endDate);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const pageSize = 7;
  const fetchLimit = 31;
  const todayKey = useMemo(() => getDateKey(new Date()), []);
  const allDateKeys = useMemo(() => {
    const dates = getDatesInRange(startDate, endDate);
    if (sortOrder === "asc") {
      return [...dates].reverse();
    }
    return dates;
  }, [endDate, sortOrder, startDate]);
  const [page, setPage] = useState(() => getTargetPageForDate(allDateKeys, todayKey, pageSize));

  const historyQ = useAttendanceHistoryQuery({
    page: 1,
    limit: fetchLimit,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const visibleDateKeys = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return allDateKeys.slice(startIndex, startIndex + pageSize);
  }, [allDateKeys, page]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(allDateKeys.length / pageSize));
  }, [allDateKeys]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, AttendanceHistoryItem>();
    for (const item of historyQ.data?.items ?? []) {
      const key = getDateKey(new Date(item.date));
      if (!map.has(key)) {
        map.set(key, item);
      }
    }
    return map;
  }, [historyQ.data?.items]);

  const displayItems = useMemo(
    () =>
      visibleDateKeys.map((dateKey) => {
        const existing = itemsByDate.get(dateKey);
        if (existing) return existing;

        return {
          id: 0,
          date: `${dateKey}T00:00:00.000Z`,
          clockInAt: null,
          clockOutAt: null,
          notes: null,
        } as AttendanceHistoryItem;
      }),
    [itemsByDate, visibleDateKeys],
  );

  const canNext = page < totalPages;

  const onApply = () => {
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
    const nextDates = getDatesInRange(draftStartDate, draftEndDate);
    const orderedDates =
      sortOrder === "asc" ? [...nextDates].reverse() : nextDates;
    setPage(getTargetPageForDate(orderedDates, todayKey, pageSize));
  };

  const onResetMonth = () => {
    const next = getCurrentMonthRange();
    setDraftStartDate(next.startDate);
    setDraftEndDate(next.endDate);
    setStartDate(next.startDate);
    setEndDate(next.endDate);
    const nextDates = getDatesInRange(next.startDate, next.endDate);
    const orderedDates =
      sortOrder === "asc" ? [...nextDates].reverse() : nextDates;
    setPage(getTargetPageForDate(orderedDates, todayKey, pageSize));
  };

  const onToggleSortOrder = () => {
    const nextSortOrder = sortOrder === "asc" ? "desc" : "asc";
    const orderedDates = [...allDateKeys].reverse();
    setSortOrder(nextSortOrder);
    setPage(getTargetPageForDate(orderedDates, todayKey, pageSize));
  };

  return (
    <Card className="rounded-2xl border border-[#1DACBC]/30 transition-shadow hover:shadow-[0_16px_36px_rgba(29,172,188,0.14)]">
      <CardHeader>
        <CardTitle className="text-[#1DACBC] text-2xl">Attendance History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        <div className="flex items-center gap-2">
          <Button
            onClick={onApply}
            disabled={historyQ.isFetching}
            className="bg-[#1DACBC]/10 text-[#138A96] hover:bg-[#1DACBC]/15"
          >
            Terapkan Filter
          </Button>
          <Button
            variant="outline"
            onClick={onResetMonth}
            disabled={historyQ.isFetching}
            className="border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5"
          >
            Bulan Ini
          </Button>
          <Button
            variant="outline"
            onClick={onToggleSortOrder}
            disabled={historyQ.isFetching}
            className="border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5"
          >
            Sort: {sortOrder === "asc" ? "Terlama" : "Terbaru"}
          </Button>
        </div>

        {historyQ.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat riwayat attendance...
          </div>
        ) : historyQ.isError ? (
          <div className="text-sm text-destructive">Gagal memuat riwayat attendance.</div>
        ) : displayItems.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Tidak ada data attendance pada rentang tanggal ini.
          </div>
        ) : (
          <div className="space-y-2">
            {displayItems.map((item, index) => {
              const status = item.clockOutAt
                ? "Completed"
                : item.clockInAt
                  ? "On Duty"
                  : "No Activity";
              const statusClassName =
                status === "On Duty"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : status === "No Activity"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-border";

              return (
                <div
                  key={`${item.id}-${item.date}-${index}`}
                  className="rounded-xl border border-[#1DACBC]/20 p-3 text-sm transition-shadow hover:shadow-[0_12px_28px_rgba(29,172,188,0.1)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-[#138A96]">{formatDate(item.date)}</p>
                    <span className={`text-xs rounded-md border px-2 py-1 ${statusClassName}`}>
                      {status}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className={item.clockInAt ? "text-green-700" : "text-red-700"}>
                      Clock In: {item.clockInAt ? formatTime(item.clockInAt) : "Worker tidak clock in"}
                    </div>
                    <div className={item.clockOutAt ? "text-green-700" : "text-red-700"}>
                      Clock Out: {item.clockOutAt ? formatTime(item.clockOutAt) : "Worker tidak clock out"}
                    </div>
                  </div>
                  {item.notes ? (
                    <p className="mt-2 text-xs text-muted-foreground">Notes: {item.notes}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || historyQ.isFetching}
          >
            Prev
          </Button>
          <p className="text-xs text-muted-foreground">Page {page}</p>
          <Button
            variant="outline"
            size="sm"
            className="border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5"
            onClick={() => setPage((p) => p + 1)}
            disabled={!canNext || historyQ.isFetching}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
