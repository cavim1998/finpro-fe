import React from "react";
import { Search, Filter } from "lucide-react";
import { BypassListViewProps } from "@/types/bypass";

type ToolbarProps = Pick<
  BypassListViewProps,
  | "roleCode"
  | "selectedOutletId"
  | "onOutletChange"
  | "selectedStatus"
  | "onStatusChange"
>;

export const FilterToolbar = ({
  roleCode,
  selectedOutletId,
  onOutletChange,
  selectedStatus,
  onStatusChange,
}: ToolbarProps) => {
  const outlets = [
    { id: 1, name: "Outlet Jakarta Pusat" },
    { id: 2, name: "Outlet Tangerang Selatan" },
    { id: 3, name: "Outlet Bekasi" },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
      <div className="flex flex-wrap gap-3 w-full xl:w-auto">
        {/* Filter Outlet (Super Admin) */}
        {roleCode === "SUPER_ADMIN" && onOutletChange && (
          <div className="relative w-full sm:w-auto">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <Filter size={14} />
            </span>
            <select
              value={selectedOutletId || ""}
              onChange={(e) => onOutletChange(Number(e.target.value))}
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none bg-white cursor-pointer w-full"
            >
              <option value="" disabled>
                -- Pilih Outlet --
              </option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filter Status */}
        {onStatusChange && (
          <select
            value={selectedStatus || ""}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none bg-white cursor-pointer w-full sm:w-auto"
          >
            <option value="">Semua Status</option>
            <option value="REQUESTED">Menunggu Persetujuan</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        )}
      </div>

      <div className="relative w-full xl:w-64">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Cari Order ID / Worker..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
        />
      </div>
    </div>
  );
};
