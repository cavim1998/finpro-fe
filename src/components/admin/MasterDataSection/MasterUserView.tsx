"use client";

import { useEffect, useState } from "react";
import { useEmployees } from "@/hooks/api/useEmployee";
import { useOutlets } from "@/hooks/api/useOutlet";
import { UsersTable } from "./UsersTable";
import { MasterToolbar } from "./MasterToolbar";
import PaginationSection from "@/components/PaginationSection";
import { MasterItemViewProps } from "@/types/master-data-admin";
import { useDebounce } from "@/hooks/use-debunce";
import { useQueryFilters } from "@/hooks/use-query-filters";

export default function MasterUserView({ actions }: MasterItemViewProps) {
  const filters = useQueryFilters("user");
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      filters.setSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  const { data: outletData } = useOutlets({ limit: 100 });
  const { data: userData } = useEmployees({
    page: filters.page,
    search: filters.search,
    outletId: filters.outletId,
  });

  return (
    <div className="space-y-6">
      <MasterToolbar
        search={localSearch}
        onSearchChange={(val) => {
          setLocalSearch(val);
          filters.setPage(1);
        }}
        placeholder="Cari nama atau email pegawai..."
        outlets={outletData?.data || []}
        selectedOutletId={filters.outletId}
        onOutletChange={(id) => filters.setOutletId(id)}
        sortOrder={filters.sortOrder}
        onSortToggle={() =>
          filters.setSortOrder(filters.sortOrder === "asc" ? "desc" : "asc")
        }
      />

      <UsersTable
        data={userData?.data || []}
        onAdd={() => actions.openModal("employee")}
        onEdit={(u) => actions.openModal("employee", u)}
        onDelete={(id, name) => actions.handleDeleteTrigger(id, name, "USERS")}
      />

      {userData?.meta && userData.meta.total > userData.meta.take && (
        <PaginationSection
          meta={{
            page: userData.meta.page,
            take: userData.meta.take,
            total: userData.meta.total,
          }}
          onClick={filters.setPage}
        />
      )}
    </div>
  );
}
