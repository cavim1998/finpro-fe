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

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { outletId, startDate, endDate };
      const res =
        reportType === "SALES"
          ? await getSalesReport(params)
          : await getPerformanceReport(params);
      setData(res.data);
    } catch (error) {
      toast.error("Gagal mengambil data laporan");
    } finally {
      setLoading(false);
    }
  }, [reportType, outletId, startDate, endDate]);

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
    data,
    loading,
    refresh: fetchReport,
  };
};
