"use client";

import { useState } from "react";
import { useLaundryItems } from "@/hooks/api/useLaundryItem";
import { ItemsGrid } from "./ItemsGrid";
import { MasterToolbar } from "./MasterToolbar";
import PaginationSection from "@/components/PaginationSection";
import { MasterItemViewProps } from "@/types/master-data-admin";
import { useDebounce } from "@/hooks/use-debunce";

export default function MasterItemView({ actions }: MasterItemViewProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data: itemData } = useLaundryItems({
    page,
    search: debouncedSearch,
    outletId: undefined,
    sortBy: "name",
    sortOrder,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR */}
      <MasterToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        placeholder="Cari jenis pakaian..."
        sortOrder={sortOrder}
        onSortToggle={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
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
            onClick={setPage}
          />
        </div>
      )}
    </div>
  );
}
