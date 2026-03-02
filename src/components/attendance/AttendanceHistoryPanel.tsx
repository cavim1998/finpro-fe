"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AttendanceHistoryItem } from "@/hooks/api/useAttendanceHistory";
import { useAttendanceHistoryQuery } from "@/hooks/api/useAttendanceHistory";
import { Loader2 } from "lucide-react";
import AttendanceHistoryFilters from "./history/AttendanceHistoryFilters";
import AttendanceHistoryPagination from "./history/AttendanceHistoryPagination";
import AttendanceHistoryRow from "./history/AttendanceHistoryRow";
import {
  buildDisplayItems,
  getCurrentMonthRange,
  getDateKey,
  getDatesInRange,
  getTargetPageForDate,
} from "./history/shared";

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
    () => buildDisplayItems(visibleDateKeys, itemsByDate),
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
        <AttendanceHistoryFilters
          draftStartDate={draftStartDate}
          draftEndDate={draftEndDate}
          sortOrder={sortOrder}
          disabled={historyQ.isFetching}
          onDraftStartDateChange={setDraftStartDate}
          onDraftEndDateChange={setDraftEndDate}
          onApply={onApply}
          onResetMonth={onResetMonth}
          onToggleSortOrder={onToggleSortOrder}
        />

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
            {displayItems.map((item, index) => (
              <AttendanceHistoryRow key={`${item.id}-${item.date}-${index}`} item={item} />
            ))}
          </div>
        )}

        <AttendanceHistoryPagination
          page={page}
          canNext={canNext}
          disabled={historyQ.isFetching}
          onPrev={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => current + 1)}
        />
      </CardContent>
    </Card>
  );
}
