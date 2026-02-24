"use client";

import { useEffect, useState } from "react";
import { useOutlets } from "@/hooks/api/useOutlet";
import { OutletsGrid } from "./OutletsGrid";
import { MasterToolbar } from "./MasterToolbar";
import PaginationSection from "@/components/PaginationSection";
import { MasterItemViewProps } from "@/types/master-data-admin";
import { useDebounce } from "@/hooks/use-debunce";
import { useQueryFilters } from "@/hooks/use-query-filters";

export default function MasterOutletView({ actions }: MasterItemViewProps) {
  const filters = useQueryFilters("outlet");
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      filters.setSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  const { data: outletData } = useOutlets({
    page: filters.page,
    search: filters.search,
    sortBy: "name",
    sortOrder: filters.sortOrder,
  });

  return (
    <div className="animate-in fade-in duration-500">
      <MasterToolbar
        search={localSearch}
        onSearchChange={(val) => {
          setLocalSearch(val);
          filters.setPage(1);
        }}
        placeholder="Cari nama outlet..."
        sortOrder={filters.sortOrder}
        onSortToggle={() =>
          filters.setSortOrder(filters.sortOrder === "asc" ? "desc" : "asc")
        }
      />

      <OutletsGrid
        data={outletData?.data || []}
        onCreate={() => actions.openModal("outlet")}
        onEdit={(o) => actions.openModal("outlet", o)}
        onDelete={(id) => actions.handleDeleteTrigger(id, "Outlet", "OUTLETS")}
      />

      {outletData?.meta && outletData.meta.total > outletData.meta.take && (
        <div className="mt-8 flex justify-center">
          <PaginationSection
            meta={{
              page: outletData.meta.page,
              take: outletData.meta.take,
              total: outletData.meta.total,
            }}
            onClick={filters.setPage}
          />
        </div>
      )}
    </div>
  );
}
