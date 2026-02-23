"use client";

import { useReportData } from "./report/useReportData";
import { ReportFilters } from "./report/ReportFilters";
import { SalesView } from "./report/SalesView";
import { PerformanceView } from "./report/PerformanceView";
import { RoleCode } from "@/types";
import { useOutlets } from "@/hooks/api/useOutlet";

interface ReportProps {
  roleCode: RoleCode | null;
  userOutletId?: number;
}

export default function ReportSection({ roleCode, userOutletId }: ReportProps) {
  const hook = useReportData(roleCode, userOutletId);
  const { data: outlets } = useOutlets();

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <ReportFilters
        role={roleCode}
        type={hook.reportType}
        setType={hook.setReportType}
        outId={hook.outletId}
        setOut={hook.setOutletId}
        sDate={hook.startDate}
        setSDate={hook.setStartDate}
        eDate={hook.endDate}
        setEDate={hook.setEndDate}
        outlets={outlets}
      />

      {hook.loading ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">
          Menghitung data laporan...
        </div>
      ) : hook.reportType === "SALES" ? (
        <SalesView data={hook.data} />
      ) : (
        <PerformanceView data={hook.data} />
      )}
    </div>
  );
}
