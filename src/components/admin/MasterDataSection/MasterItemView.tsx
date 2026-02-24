"use client";

import { useEffect, useState } from "react";
import { useLaundryItems } from "@/hooks/api/useLaundryItem";
import { ItemsGrid } from "./ItemsGrid";
import { MasterToolbar } from "./MasterToolbar";
import PaginationSection from "@/components/PaginationSection";
import { MasterItemViewProps } from "@/types/master-data-admin";
import { useDebounce } from "@/hooks/use-debunce";
import { useQueryFilters } from "@/hooks/use-query-filters";

export default function MasterItemView({ actions }: MasterItemViewProps) {
  const filters = useQueryFilters("item");
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      filters.setSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  const { data: itemData } = useLaundryItems({
    page: filters.page,
    search: filters.search,
    outletId: undefined,
    sortBy: "name",
    sortOrder: filters.sortOrder,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR */}
      <MasterToolbar
        search={localSearch}
        onSearchChange={(val) => {
          setLocalSearch(val);
          filters.setPage(1);
        }}
        placeholder="Cari jenis pakaian..."
        sortOrder={filters.sortOrder}
        onSortToggle={() =>
          filters.setSortOrder(filters.sortOrder === "asc" ? "desc" : "asc")
        }
      />

      {/* GRID TAMPILAN */}
      <ItemsGrid
        data={itemData?.data || []}
        onCreate={() => actions.openModal("item")}
        onEdit={(i) => actions.openModal("item", i)}
        onDelete={(id) => actions.handleDeleteTrigger(id, "Item", "ITEMS")}
      />

      {/* PAGINATION */}
      {itemData?.meta && itemData.meta.total > itemData.meta.take && (
        <div className="mt-8 flex justify-center">
          <PaginationSection
            meta={{
              page: itemData.meta.page,
              take: itemData.meta.take,
              total: itemData.meta.total,
            }}
            onClick={filters.setPage}
          />
        </div>
      )}
    </div>
  );
}
