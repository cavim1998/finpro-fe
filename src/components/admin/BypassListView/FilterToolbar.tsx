import { Search, Filter, ArrowUpDown } from "lucide-react";
import { BypassListViewProps } from "@/types/bypass";

interface ToolbarProps extends Partial<BypassListViewProps> {
  search: string;
  onSearchChange: (val: string) => void;
  sortBy?: string;
  onSortByChange?: (val: string) => void;
  sortOrder?: "asc" | "desc";
  onSortOrderChange?: (val: "asc" | "desc") => void;
  outlets?: any[];
}

export const FilterToolbar = ({
  roleCode,
  selectedOutletId,
  onOutletChange,
  selectedStatus,
  onStatusChange,
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  outlets = [],
}: ToolbarProps) => {
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
              <option value="">-- Semua Outlet --</option>
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

        <div className="flex border border-gray-200 rounded-lg overflow-hidden w-full sm:w-auto">
          <select
            value={sortBy || "createdAt"}
            onChange={(e) => onSortByChange && onSortByChange(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 border-r border-gray-200 focus:outline-none cursor-pointer"
          >
            <option value="createdAt">Tanggal Request</option>
            <option value="status">Status</option>
          </select>
          <button
            onClick={() =>
              onSortOrderChange &&
              onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
            }
            className="px-2 py-2 bg-white hover:bg-gray-50 text-gray-500"
          >
            <ArrowUpDown size={14} />
          </button>
        </div>
      </div>

      <div className="relative w-full xl:w-64">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari Alasan / Nama..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
        />
      </div>
    </div>
  );
};
