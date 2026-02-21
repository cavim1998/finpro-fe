"use client";

import { useState } from "react";
import { useLaundryItems } from "@/hooks/api/useLaundryItem";
import { useOutlets } from "@/hooks/api/useOutlet";
import { ItemsGrid } from "./ItemsGrid";
import { MasterToolbar } from "./MasterToolbar";
import PaginationSection from "@/components/PaginationSection";
import { Layers, Shirt } from "lucide-react";
import { MasterItemViewProps } from "@/types/master-data-admin";

export default function MasterItemView({ actions }: MasterItemViewProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterOutlet, setFilterOutlet] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [categoryTab, setCategoryTab] = useState<"SERVICE" | "CLOTHING">(
    "SERVICE",
  );

  const { data: outletData } = useOutlets({ limit: 100 });
  const { data: itemData } = useLaundryItems({
    page,
    limit: 9,
    search,
    outletId: filterOutlet || undefined,
    sortBy: "name",
    sortOrder,
  });

  const filteredData =
    itemData?.data?.filter((item: any) =>
      categoryTab === "SERVICE" ? item.price > 0 : item.price === 0,
    ) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TAB KATEGORI INTERNAL */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => {
            setCategoryTab("SERVICE");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${categoryTab === "SERVICE" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
        >
          <Layers size={16} /> Layanan & Harga
        </button>
        <button
          onClick={() => {
            setCategoryTab("CLOTHING");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${categoryTab === "CLOTHING" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
        >
          <Shirt size={16} /> Jenis Pakaian
        </button>
      </div>

      {/* TOOLBAR */}
      <MasterToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        placeholder={
          categoryTab === "SERVICE"
            ? "Cari layanan..."
            : "Cari jenis pakaian..."
        }
        filterValue={filterOutlet}
        onFilterChange={(val) => {
          setFilterOutlet(val);
          setPage(1);
        }}
        filterOptions={outletData?.data}
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
