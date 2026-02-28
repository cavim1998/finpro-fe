"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import PaginationSection from "@/components/PaginationSection";

type AttendanceMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

type AttendanceViewProps = {
  data: unknown;
  meta: AttendanceMeta | null;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

type AttendanceReportRow = {
  outletStaffId: number;
  userId: number;
  employeeName: string;
  position: string;
  outletName: string;
  totalClockIn: number;
  totalClockOut: number;
};

function toObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapAttendanceReportRow(row: unknown): AttendanceReportRow {
  const record = toObject(row);
  const outlet = toObject(record.outlet);

  return {
    outletStaffId: toNumber(record.outletStaffId),
    userId: toNumber(record.userId),
    employeeName: String(record.employeeName ?? "Tanpa Nama"),
    position: String(record.position ?? "-"),
    outletName: String(outlet.name ?? "-"),
    totalClockIn: toNumber(record.totalClockIn),
    totalClockOut: toNumber(record.totalClockOut),
  };
}

export const AttendanceView = ({
  data,
  meta,
  loading,
  onPageChange,
}: AttendanceViewProps) => {
  const rows = useMemo(() => {
    const payload = toObject(data);
    const items = Array.isArray(data)
      ? data
      : Array.isArray(payload.items)
        ? payload.items
        : [];
    return items.map((item) => mapAttendanceReportRow(item));
  }, [data]);

  const currentMeta = {
    page: meta?.page ?? 1,
    take: meta?.limit ?? 10,
    total: meta?.total ?? 0,
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b p-6">
          <h3 className="text-lg font-bold">Attendance</h3>
        </div>

        <div className="min-h-[300px] overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Nama Pegawai</th>
                <th className="px-6 py-4">Posisi</th>
                <th className="px-6 py-4">Outlet</th>
                <th className="px-6 py-4 text-center">Jumlah Clock In</th>
                <th className="px-6 py-4 text-center">Jumlah Clock Out</th>
                <th className="px-6 py-4 text-center">Detail</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    Memuat data attendance...
                  </td>
                </tr>
              ) : rows.length > 0 ? (
                rows.map((row) => (
                  <tr
                    key={`${row.outletStaffId}-${row.userId}`}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {row.employeeName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded border bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        {row.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{row.outletName}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded bg-cyan-50 px-2 py-1 font-medium text-[#17A2B8]">
                        {row.totalClockIn}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded bg-emerald-50 px-2 py-1 font-medium text-emerald-600">
                        {row.totalClockOut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/admin/attendance/${row.outletStaffId}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#17A2B8]/30 px-3 py-2 text-xs font-medium text-[#17A2B8] transition-colors hover:bg-[#17A2B8]/5"
                      >
                        <Eye size={14} />
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    Tidak ada data attendance pada periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {currentMeta.total > currentMeta.take ? (
          <div className="flex justify-center border-t border-gray-100 bg-gray-50 p-4">
            <PaginationSection
              meta={currentMeta}
              onClick={(newPage) => onPageChange(newPage)}
            />
          </div>
        ) : null}
      </div>

    </>
  );
};
