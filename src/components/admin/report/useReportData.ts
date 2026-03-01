import { useState, useEffect, useCallback } from "react";
import {
  getSalesReport,
  getPerformanceReport,
  getAttendanceReport,
  getAdminAttendanceReport,
} from "@/services/report.service";
import { toast } from "sonner";
import { RoleCode } from "@/types";

function toObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

export const useReportData = (
  roleCode: RoleCode | null,
  userOutletId?: number,
) => {
  const [reportType, setReportType] = useState<"SALES" | "PERFORMANCE" | "ATTENDANCE">(
    "SALES",
  );
  const [outletId, setOutletId] = useState<number | undefined>(userOutletId);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [page, setPage] = useState(1);
  const limit = 10;

  const [data, setData] = useState<unknown>(null);
  const [meta, setMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [reportType, outletId, startDate, endDate]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      if (reportType === "ATTENDANCE") {
        if (roleCode === "SUPER_ADMIN") {
          const res = await getAdminAttendanceReport({
            page,
            limit,
            startDate,
            endDate,
          });
          const payload = toObject(res?.data ?? res);
          const pagination = toObject(payload.pagination);

          setData({
            items: Array.isArray(payload.items) ? payload.items : [],
          });
          setMeta({
            page: Number(pagination.page ?? page),
            limit: Number(pagination.limit ?? limit),
            total: Number(pagination.total ?? 0),
            totalPages: Number(pagination.totalPages ?? 0),
          });
        } else {
          const res = await getAttendanceReport({
            page,
            limit,
            startDate,
            endDate,
          });
          setData(res?.data ?? []);
          setMeta(
            res?.meta ?? {
              page,
              limit,
              total: 0,
              totalPages: 0,
            },
          );
        }
        return;
      }

      const params = { outletId, startDate, endDate, page, limit };
      const res =
        reportType === "SALES"
          ? await getSalesReport(params)
          : await getPerformanceReport(params);

      setData(res.data);
      setMeta(res.meta);
    } catch {
      toast.error("Gagal mengambil data laporan");
    } finally {
      setLoading(false);
    }
  }, [reportType, outletId, startDate, endDate, page, roleCode]);

  useEffect(() => {
    if (roleCode) fetchReport();
  }, [fetchReport, roleCode]);

  return {
    reportType,
    setReportType,
    outletId,
    setOutletId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    page,
    setPage,
    data,
    meta,
    loading,
    refresh: fetchReport,
  };
};
