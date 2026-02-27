import { useState, useEffect, useCallback } from "react";
import {
  getSalesReport,
  getPerformanceReport,
} from "@/services/report.service";
import { toast } from "sonner";
import { RoleCode } from "@/types";

export const useReportData = (
  roleCode: RoleCode | null,
  userOutletId?: number,
) => {
  const [reportType, setReportType] = useState<"SALES" | "PERFORMANCE">(
    "SALES",
  );
  const [outletId, setOutletId] = useState<number | undefined>(userOutletId);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [page, setPage] = useState(1);
  const limit = 10;

  const [data, setData] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [reportType, outletId, startDate, endDate]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { outletId, startDate, endDate, page, limit };
      const res =
        reportType === "SALES"
          ? await getSalesReport(params)
          : await getPerformanceReport(params);

      setData(res.data);
      setMeta(res.meta);
    } catch (error) {
      toast.error("Gagal mengambil data laporan");
    } finally {
      setLoading(false);
    }
  }, [reportType, outletId, startDate, endDate, page]);

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
