"use client";

import { useState } from "react";
import { ShiftsGrid } from "./ShiftsGrid";
import { MasterToolbar } from "./MasterToolbar";
import PaginationSection from "@/components/PaginationSection";
import { useDebounce } from "@/hooks/use-debunce";
import { useShiftTemplates } from "@/hooks/api/useShift";
import { useOutlets } from "@/hooks/api/useOutlet";

export default function MasterShiftView({ actions }: any) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { data: outlets } = useOutlets();
  const [selectedOutletId, setSelectedOutletId] = useState<number | undefined>(
    undefined,
  );

  const { data: shiftData } = useShiftTemplates({
    page,
    search: debouncedSearch,
    sortBy: "name",
    sortOrder,
    outletId: selectedOutletId,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. TOOLBAR FILTER & SEARCH */}
      <MasterToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        placeholder="Cari nama shift..."
        sortOrder={sortOrder}
        onSortToggle={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        outlets={outlets?.data}
        selectedOutletId={selectedOutletId}
        onOutletChange={(id) => {
          setSelectedOutletId(id);
          setPage(1); // Selalu reset ke halaman 1 setiap ganti filter
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
          <PaginationSection meta={shiftData.meta} onClick={setPage} />
        </div>
      )}
    </div>
  );
}
