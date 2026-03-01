"use client";

import * as XLSX from "xlsx";
import { useReportData } from "./report/useReportData";
import { ReportFilters } from "./report/ReportFilters";
import { SalesView } from "./report/SalesView";
import { PerformanceView } from "./report/PerformanceView";
import { AttendanceView, mapAttendanceReportRow } from "./report/AttendanceView";
import { RoleCode } from "@/types";
import { useOutlets } from "@/hooks/api/useOutlet";
import { toast } from "sonner";
import { useState } from "react";
import {
  getSalesReport,
  getPerformanceReport,
  getAttendanceReport,
  getAdminAttendanceReport,
} from "@/services/report.service";

interface ReportProps {
  roleCode: RoleCode | null;
  userOutletId?: number;
}

type ExportRow = Record<string, string | number>;

function toObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
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

      let excelData: ExportRow[] = [];
      let fileName = "";

      if (hook.reportType === "SALES") {
        const res = await getSalesReport(params);
        const payload = toObject(res?.data);
        const orders: unknown[] = Array.isArray(payload.orders) ? payload.orders : [];

        excelData = orders.map((order: unknown) => {
          const o = toObject(order);
          return {
            "Nomor Order": String(o.orderNo ?? "-"),
            "Nama Pelanggan": String(o.customerName ?? "-"),
            "Nama Outlet": String(o.outletName ?? "-"),
            "Tanggal Transaksi": new Date(String(o.createdAt ?? "")).toLocaleString("id-ID"),
            "Total Pendapatan (Rp)": Number(o.totalAmount ?? 0),
          };
        });

        fileName = `Laporan_Penjualan_${hook.startDate || "Semua"}.xlsx`;
      } else if (hook.reportType === "PERFORMANCE") {
        const res = await getPerformanceReport(params);
        const employees: unknown[] = Array.isArray(res?.data) ? res.data : [];

        excelData = employees.map((employee: unknown) => {
          const emp = toObject(employee);
          return {
            "Nama Pegawai": String(emp.name ?? "-"),
            Posisi: String(emp.role ?? "-"),
            "Nama Outlet": String(emp.outletName ?? "-"),
            "Tugas Cucian Diselesaikan": Number(emp.stationJobsDone ?? 0),
            "Tugas Antar/Jemput": Number(emp.deliveryJobsDone ?? 0),
            "Total Pekerjaan": Number(emp.jobsDone ?? 0),
          };
        });

        fileName = `Laporan_Performa_Pegawai_${hook.startDate || "Semua"}.xlsx`;
      } else {
        if (roleCode === "SUPER_ADMIN") {
          const exportLimit = 100;
          let exportPage = 1;
          let totalPages = 1;
          const items: unknown[] = [];

          while (exportPage <= totalPages) {
            const res = await getAdminAttendanceReport({
              page: exportPage,
              limit: exportLimit,
              startDate: hook.startDate,
              endDate: hook.endDate,
            });

            const payload = toObject(res?.data ?? res);
            const pageItems: unknown[] = Array.isArray(payload.items) ? payload.items : [];
            const pagination = toObject(payload.pagination);

            items.push(...pageItems);
            totalPages = Number(pagination.totalPages ?? exportPage);
            exportPage += 1;
          }

          excelData = items.map((item: unknown) => {
            const row = mapAttendanceReportRow(item, true);
            return {
              Tanggal: row.date,
              "Nama Pegawai": row.employeeName,
              Posisi: row.position,
              Outlet: row.outletName,
              "Clock In": row.clockInAt,
              "Clock Out": row.clockOutAt,
            };
          });
        } else {
          const exportLimit = 100;
          let exportPage = 1;
          let totalPages = 1;
          const items: unknown[] = [];

          while (exportPage <= totalPages) {
            const res = await getAttendanceReport({
              page: exportPage,
              limit: exportLimit,
              startDate: hook.startDate,
              endDate: hook.endDate,
            });

            const pageItems: unknown[] = Array.isArray(res?.data) ? res.data : [];
            items.push(...pageItems);
            totalPages = Number(res?.meta?.totalPages ?? exportPage);
            exportPage += 1;
          }

          excelData = items.map((item: unknown) => {
            const row = mapAttendanceReportRow(item);
            return {
              "Nama Pegawai": row.employeeName,
              Posisi: row.position,
              Outlet: row.outletName,
              "Jumlah Clock In": row.totalClockIn,
              "Jumlah Clock Out": row.totalClockOut,
            };
          });
        }

        fileName = `Laporan_Attendance_${hook.startDate || "Semua"}.xlsx`;
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
      ) : hook.reportType === "ATTENDANCE" ? (
        <AttendanceView
          data={hook.data}
          meta={hook.meta}
          roleCode={roleCode}
          loading={hook.loading}
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
