"use client";

import * as XLSX from "xlsx";
import { useReportData } from "./report/useReportData";
import { ReportFilters } from "./report/ReportFilters";
import { SalesView } from "./report/SalesView";
import { PerformanceView } from "./report/PerformanceView";
import { RoleCode } from "@/types";
import { useOutlets } from "@/hooks/api/useOutlet";
import { toast } from "sonner";
import { useState } from "react";
import {
  getSalesReport,
  getPerformanceReport,
} from "@/services/report.service";

interface ReportProps {
  roleCode: RoleCode | null;
  userOutletId?: number;
}

export default function ReportSection({ roleCode, userOutletId }: ReportProps) {
  const hook = useReportData(roleCode, userOutletId);
  const { data: outlets } = useOutlets();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const params = {
        outletId: hook.outletId,
        startDate: hook.startDate,
        endDate: hook.endDate,
        page: 1,
        limit: 999999,
      };

      let excelData: any[] = [];
      let fileName = "";

      if (hook.reportType === "SALES") {
        const res = await getSalesReport(params);
        const orders = res?.data?.orders || [];

        excelData = orders.map((o: any) => ({
          "Nomor Order": o.orderNo,
          "Nama Pelanggan": o.customerName,
          "Nama Outlet": o.outletName,
          "Tanggal Transaksi": new Date(o.createdAt).toLocaleString("id-ID"),
          "Total Pendapatan (Rp)": Number(o.totalAmount),
        }));

        fileName = `Laporan_Penjualan_${hook.startDate || "Semua"}.xlsx`;
      } else {
        const res = await getPerformanceReport(params);
        const employees = res?.data || [];

        excelData = employees.map((emp: any) => ({
          "Nama Pegawai": emp.name,
          Posisi: emp.role,
          "Nama Outlet": emp.outletName,
          "Tugas Cucian Diselesaikan": emp.stationJobsDone,
          "Tugas Antar/Jemput": emp.deliveryJobsDone,
          "Total Pekerjaan": emp.jobsDone,
        }));

        fileName = `Laporan_Performa_Pegawai_${hook.startDate || "Semua"}.xlsx`;
      }

      if (excelData.length === 0) {
        toast.error("Tidak ada data untuk diexspor pada periode ini.");
        setIsExporting(false);
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");

      XLSX.writeFile(workbook, fileName);
      toast.success("Berhasil mengekspor data ke Excel!");
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Terjadi kesalahan saat mengekspor data.");
    } finally {
      setIsExporting(false);
    }
  };

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
        onExport={handleExportExcel}
        isExporting={isExporting}
      />

      {hook.loading ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">
          Menghitung data laporan...
        </div>
      ) : hook.reportType === "SALES" ? (
        <SalesView
          data={hook.data}
          meta={hook.meta}
          onPageChange={hook.setPage}
        />
      ) : (
        <PerformanceView
          data={hook.data}
          meta={hook.meta}
          onPageChange={hook.setPage}
        />
      )}
    </div>
  );
}
