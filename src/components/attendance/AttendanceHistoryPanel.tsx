"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const [page, setPage] = useState(1);
  const limit = 7;

  const historyQ = useAttendanceHistoryQuery({
    page,
    limit,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const items = historyQ.data?.items ?? [];
  const totalPages = Number(historyQ.data?.pagination?.totalPages ?? 0);
  const canNext = totalPages > 0 ? page < totalPages : items.length === limit;

  const onApply = () => {
    setPage(1);
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
  };

  const onResetMonth = () => {
    const next = getCurrentMonthRange();
    setPage(1);
    setDraftStartDate(next.startDate);
    setDraftEndDate(next.endDate);
    setStartDate(next.startDate);
    setEndDate(next.endDate);
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Attendance History</CardTitle>
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
          <Button onClick={onApply} disabled={historyQ.isFetching}>
            Terapkan Filter
          </Button>
          <Button variant="outline" onClick={onResetMonth} disabled={historyQ.isFetching}>
            Bulan Ini
          </Button>
        </div>

        {historyQ.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat riwayat attendance...
          </div>
        ) : historyQ.isError ? (
          <div className="text-sm text-destructive">Gagal memuat riwayat attendance.</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Tidak ada data attendance pada rentang tanggal ini.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const status = item.clockOutAt
                ? "Completed"
                : item.clockInAt
                  ? "On Duty"
                  : "No Activity";

              return (
                <div key={item.id} className="rounded-xl border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{formatDate(item.date)}</p>
                    <span className="text-xs rounded-md border px-2 py-1">{status}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Clock In: {formatTime(item.clockInAt)}</div>
                    <div>Clock Out: {formatTime(item.clockOutAt)}</div>
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
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || historyQ.isFetching}
          >
            Prev
          </Button>
          <p className="text-xs text-muted-foreground">Page {page}</p>
          <Button
            variant="outline"
            size="sm"
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

