"use client";

import { useState } from "react";
import { useOutlets } from "@/hooks/api/useOutlet";
import { OutletsGrid } from "./OutletsGrid";
import { MasterToolbar } from "./MasterToolbar";
import PaginationSection from "@/components/PaginationSection";
import { MasterItemViewProps } from "@/types/master-data-admin";

export default function MasterOutletView({ actions }: MasterItemViewProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data: outletData } = useOutlets({
    page,
    limit: 6,
    search,
    sortBy: "name",
    sortOrder,
  });

  return (
    <div className="animate-in fade-in duration-500">
      <MasterToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        placeholder="Cari nama outlet..."
        sortOrder={sortOrder}
        onSortToggle={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
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
            onClick={setPage}
          />
        </div>
      )}
    </div>
  );
}
