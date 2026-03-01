"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getAdminAttendanceHistoryDetailReport,
  getAttendanceHistoryDetailReport,
} from "@/services/report.service";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { RoleCode } from "@/types";

type Props = {
  outletStaffId: number;
  roleCode: RoleCode | null;
};

type HistoryItem = {
  id: number;
  date: string;
  clockInAt: string | null;
  clockOutAt: string | null;
  notes?: string | null;
};

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

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeResponse(data: unknown) {
  const payload = toObject(data);
  const nestedData = toObject(payload.data);
  const contentData = toObject(nestedData.data);
  const items = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(nestedData.items)
      ? nestedData.items
      : Array.isArray(contentData.items)
        ? contentData.items
      : Array.isArray(payload.data)
        ? (payload.data as unknown[])
        : [];
  const pagination = toObject(payload.pagination);
  const legacyPagination = toObject(payload.meta);
  const nestedPagination = toObject(nestedData.pagination);
  const contentPagination = toObject(contentData.pagination);
  const filter = toObject(payload.filter);
  const nestedFilter = toObject(nestedData.filter);
  const contentFilter = toObject(contentData.filter);

  return {
    items: items.map((item) => item as HistoryItem),
    pagination:
      Object.keys(pagination).length > 0
        ? pagination
        : Object.keys(legacyPagination).length > 0
          ? legacyPagination
          : Object.keys(nestedPagination).length > 0
            ? nestedPagination
            : contentPagination,
    filter:
      Object.keys(filter).length > 0
        ? filter
        : Object.keys(nestedFilter).length > 0
          ? nestedFilter
          : contentFilter,
  };
}

export default function AttendanceHistoryDetailView({
  outletStaffId,
  roleCode,
}: Props) {
  const defaults = useMemo(() => getCurrentMonthRange(), []);
  const [draftStartDate, setDraftStartDate] = useState(defaults.startDate);
  const [draftEndDate, setDraftEndDate] = useState(defaults.endDate);
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const limit = 7;

  const detailQ = useQuery({
    queryKey: [
      "reports",
      "attendance",
      "history",
      roleCode,
      outletStaffId,
      page,
      startDate,
      endDate,
    ],
    queryFn: async () =>
      roleCode === "SUPER_ADMIN"
        ? getAdminAttendanceHistoryDetailReport(outletStaffId, {
            page,
            limit,
            startDate,
            endDate,
          })
        : getAttendanceHistoryDetailReport(outletStaffId, {
            page,
            limit,
            startDate,
            endDate,
          }),
    enabled: outletStaffId > 0,
  });

  const normalized = useMemo(
    () => normalizeResponse(detailQ.data),
    [detailQ.data],
  );

  const items = normalized.items;
  const totalPages = Number(normalized.pagination.totalPages ?? 0);
  const canNext = totalPages > 0 ? page < totalPages : items.length === limit;

  const onApply = () => {
    setPage(1);
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
  };

  const onReset = () => {
    const next = getCurrentMonthRange();
    setPage(1);
    setDraftStartDate(next.startDate);
    setDraftEndDate(next.endDate);
    setStartDate(next.startDate);
    setEndDate(next.endDate);
  };

  const onExport = async () => {
    setIsExporting(true);
    try {
      const exportLimit = 100;
      let exportPage = 1;
      let totalPagesForExport = 1;
      const collectedItems: HistoryItem[] = [];

      while (exportPage <= totalPagesForExport) {
        const response = roleCode === "SUPER_ADMIN"
          ? await getAdminAttendanceHistoryDetailReport(outletStaffId, {
              page: exportPage,
              limit: exportLimit,
              startDate,
              endDate,
            })
          : await getAttendanceHistoryDetailReport(outletStaffId, {
              page: exportPage,
              limit: exportLimit,
              startDate,
              endDate,
            });
        const normalizedResponse = normalizeResponse(response);
        collectedItems.push(...normalizedResponse.items);

        totalPagesForExport = Number(
          normalizedResponse.pagination.totalPages ?? exportPage,
        );
        exportPage += 1;
      }

      const exportRows = collectedItems.map((item) => ({
        Tanggal: formatDate(item.date),
        "Clock In": item.clockInAt ? formatTime(item.clockInAt) : "Worker tidak clock in",
        "Clock Out": item.clockOutAt ? formatTime(item.clockOutAt) : "Worker tidak clock out",
        Notes: item.notes ?? "",
      }));

      if (exportRows.length === 0) {
        toast.error("Tidak ada data attendance untuk diekspor.");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Detail");
      XLSX.writeFile(workbook, `Attendance_Detail_${outletStaffId}.xlsx`);
      toast.success("Berhasil mengekspor data attendance.");
    } catch (error) {
      console.error("Attendance detail export error", error);
      toast.error("Gagal mengekspor data attendance.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" className="gap-2 text-[#1DACBC] hover:bg-[#1DACBC]/5 hover:text-[#138A96]">
          <Link href="/admin?tab=REPORT">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Reports
          </Link>
        </Button>

        <Button
          onClick={onExport}
          disabled={isExporting || detailQ.isFetching}
          className="bg-[#1DACBC] text-white hover:bg-[#1697A5]"
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export Excel
        </Button>
      </div>

      <Card className="rounded-2xl border border-[#1DACBC]/30 transition-shadow hover:shadow-[0_16px_36px_rgba(29,172,188,0.14)]">
        <CardHeader>
          <CardTitle className="text-[#1DACBC]">Attendance History Detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              onClick={onApply}
              disabled={detailQ.isFetching}
              className="bg-[#1DACBC]/10 text-[#138A96] hover:bg-[#1DACBC]/15"
            >
              Terapkan Filter
            </Button>
            <Button
              variant="outline"
              onClick={onReset}
              disabled={detailQ.isFetching}
              className="border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5"
            >
              Bulan Ini
            </Button>
          </div>

          {detailQ.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat riwayat attendance...
            </div>
          ) : detailQ.isError ? (
            <div className="text-sm text-destructive">
              Gagal memuat detail attendance.
            </div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Tidak ada data attendance pada periode ini.
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => {
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
                      <p className="font-semibold text-[#138A96]">
                        {formatDate(item.date)}
                      </p>
                      <span className={`rounded-md border px-2 py-1 text-xs ${statusClassName}`}>
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
                      <p className="mt-2 text-xs text-muted-foreground">
                        Notes: {item.notes}
                      </p>
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
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || detailQ.isFetching}
            >
              Prev
            </Button>
            <p className="text-xs text-muted-foreground">Page {page}</p>
            <Button
              variant="outline"
              size="sm"
              className="border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5"
              onClick={() => setPage((current) => current + 1)}
              disabled={!canNext || detailQ.isFetching}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
