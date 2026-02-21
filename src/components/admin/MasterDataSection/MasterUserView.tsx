"use client";

import { useState } from "react";
import { useEmployees } from "@/hooks/api/useEmployee";
import { useOutlets } from "@/hooks/api/useOutlet";
import { UsersTable } from "./UsersTable";
import { MasterToolbar } from "./MasterToolbar";
import PaginationSection from "@/components/PaginationSection";
import { MasterItemViewProps } from "@/types/master-data-admin";

export default function MasterUserView({ actions }: MasterItemViewProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterOutlet, setFilterOutlet] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data: outletData } = useOutlets({ limit: 100 });
  const { data: userData } = useEmployees({
    page,
    search,
    outletId: filterOutlet || undefined,
  });

  return (
    <div className="space-y-6">
      <MasterToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        placeholder="Cari nama atau email pegawai..."
        filterValue={filterOutlet}
        onFilterChange={(val) => {
          setFilterOutlet(val);
          setPage(1);
        }}
        filterOptions={outletData?.data}
        sortOrder={sortOrder}
        onSortToggle={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
      />

      <UsersTable
        data={userData?.data || []}
        onAdd={() => actions.openModal("employee")}
        onEdit={(u) => actions.openModal("employee", u)}
        onDelete={(id, name) => actions.handleDeleteTrigger(id, name, "USERS")}
      />

      {userData?.meta && (
        <PaginationSection
          meta={{
            page: userData.meta.page,
            take: userData.meta.take,
            total: userData.meta.total,
          }}
          onClick={setPage}
        />
      )}
    </div>
  );
}
