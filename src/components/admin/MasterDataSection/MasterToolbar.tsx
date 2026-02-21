"use client";

import { Search, Filter, ArrowUpDown } from "lucide-react";

interface MasterToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filterValue?: string | number;
  onFilterChange?: (value: string) => void;
  filterOptions?: { id: string | number; name: string }[];
  sortOrder: "asc" | "desc";
  onSortToggle: () => void;
}

export const MasterToolbar = ({
  search,
  onSearchChange,
  placeholder = "Cari...",
  filterValue,
  onFilterChange,
  filterOptions,
  sortOrder,
  onSortToggle,
}: MasterToolbarProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        {onFilterChange && filterOptions && (
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-100"
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
            >
              <option value="">Semua</option>
              {filterOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={onSortToggle}
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Sort: {sortOrder === "asc" ? "A-Z" : "Z-A"}
          <ArrowUpDown size={14} />
        </button>
      </div>
    </div>
  );
};
