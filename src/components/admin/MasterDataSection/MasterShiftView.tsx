"use client";

import { useEffect, useState } from "react";
import { ShiftsGrid } from "./ShiftsGrid";
import { MasterToolbar } from "./MasterToolbar";
import PaginationSection from "@/components/PaginationSection";
import { useDebounce } from "@/hooks/use-debunce";
import { useShiftTemplates } from "@/hooks/api/useShift";
import { useOutlets } from "@/hooks/api/useOutlet";
import { useQueryFilters } from "@/hooks/use-query-filters";

export default function MasterShiftView({ actions }: any) {
  const { data: outlets } = useOutlets();
  const [selectedOutletId, setSelectedOutletId] = useState<number | undefined>(
    undefined,
  );
  const filters = useQueryFilters("shift");
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch, 500);

  const { data: shiftData } = useShiftTemplates({
    page: filters.page,
    search: filters.search,
    sortBy: "name",
    sortOrder: filters.sortOrder,
    outletId: filters.outletId,
  });

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      filters.setSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. TOOLBAR FILTER & SEARCH */}
      <MasterToolbar
        search={localSearch}
        onSearchChange={(val) => {
          setLocalSearch(val);
          filters.setPage(1);
        }}
        placeholder="Cari nama shift..."
        sortOrder={filters.sortOrder}
        onSortToggle={() =>
          filters.setSortOrder(filters.sortOrder === "asc" ? "desc" : "asc")
        }
        outlets={outlets?.data}
        selectedOutletId={selectedOutletId}
        onOutletChange={(id) => {
          setSelectedOutletId(id);
          filters.setPage(1);
        }}
      />

      {/* 2. GRID TAMPILAN SHIFT */}
      <ShiftsGrid
        data={shiftData?.data || []}
        onCreate={() => actions.openModal("shift")}
        onDelete={(id) => actions.handleDeleteTrigger(id, "Shift", "SHIFTS")}
      />

      {/* 3. PAGINATION */}
      {shiftData?.meta && shiftData.meta.total > shiftData.meta.take && (
        <div className="mt-8 flex justify-center">
          <PaginationSection meta={shiftData.meta} onClick={filters.setPage} />
        </div>
      )}
    </div>
  );
}
