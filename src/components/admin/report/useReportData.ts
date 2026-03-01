import { useState, useEffect, useCallback, useRef } from "react";
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
  const limit = reportType === "ATTENDANCE" ? 5 : 10;

  const [data, setData] = useState<unknown>(null);
  const [meta, setMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setPage(1);
  }, [reportType, outletId, startDate, endDate]);

  const fetchReport = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);

    const applyIfLatest = (callback: () => void) => {
      if (requestIdRef.current !== requestId) return;
      callback();
    };

    try {
      if (reportType === "ATTENDANCE") {
        if (roleCode === "SUPER_ADMIN") {
          const res = await getAdminAttendanceReport({
            page,
            limit,
            outletId,
            startDate,
            endDate,
          });
          const payload = toObject(res);
          const nestedData = toObject(payload.data);
          const pagination = toObject(payload.pagination);
          const nestedPagination = toObject(nestedData.pagination);
          const currentPagination =
            Object.keys(pagination).length > 0 ? pagination : nestedPagination;

          applyIfLatest(() => {
            setData(
              Array.isArray(payload.items)
                ? payload.items
                : Array.isArray(nestedData.items)
                  ? nestedData.items
                  : [],
            );
            setMeta({
              page: Number(currentPagination.page ?? page),
              limit: Number(currentPagination.limit ?? limit),
              total: Number(currentPagination.total ?? 0),
              totalPages: Number(currentPagination.totalPages ?? 0),
            });
          });
        } else {
          const res = await getAttendanceReport({
            page,
            limit,
            outletId,
            startDate,
            endDate,
          });
          applyIfLatest(() => {
            setData(res?.data ?? []);
            setMeta(
              res?.meta ?? {
                page,
                limit,
                total: 0,
                totalPages: 0,
              },
            );
          });
        }
        return;
      }

      const params = { outletId, startDate, endDate, page, limit };
      const res =
        reportType === "SALES"
          ? await getSalesReport(params)
          : await getPerformanceReport(params);

      applyIfLatest(() => {
        setData(res.data);
        setMeta(res.meta);
      });
    } catch {
      if (requestIdRef.current === requestId) {
        toast.error("Gagal mengambil data laporan");
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
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
