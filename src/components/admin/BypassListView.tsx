import PaginationSection from "@/components/PaginationSection";
import { FilterToolbar } from "./BypassListView/FilterToolbar";
import { BypassListItem } from "./BypassListView/BypassListItem";
import { LoadingState, EmptyState } from "./BypassListView/StateViews";
import { BypassListViewProps } from "@/types/bypass";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debunce";

interface ExtendedProps extends BypassListViewProps {
  search: string;
  onSearchChange: (val: string) => void;
  sortBy?: string;
  onSortByChange?: (val: string) => void;
  sortOrder?: "asc" | "desc";
  onSortOrderChange?: (val: "asc" | "desc") => void;
  outlets: any[];
}

export default function BypassListView(props: ExtendedProps) {
  const {
    data,
    loading,
    page,
    limit,
    totalData,
    onPageChange,
    search,
    onSearchChange,
    outlets,
  } = props;

  const [localSearch, setLocalSearch] = useState(search || "");
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    if (debouncedSearch !== search) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (search !== localSearch) {
      setLocalSearch(search || "");
    }
  }, [search]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bypass Requests</h1>
        <p className="text-sm text-gray-500">
          Manajemen permintaan perubahan stok manual dari stasiun kerja.
        </p>
      </div>

      <FilterToolbar
        {...props}
        search={localSearch}
        onSearchChange={setLocalSearch}
      />

      <div className="space-y-4 min-h-75">
        {loading ? (
          <LoadingState />
        ) : !data || data.length === 0 ? (
          <EmptyState />
        ) : (
          data.map((item) => (
            <BypassListItem
              key={item.id}
              item={item}
              onRefresh={props.onRefresh}
            />
          ))
        )}
      </div>

      {totalData > limit && (
        <div className="mt-8 flex justify-center">
          <PaginationSection
            meta={{ page, take: limit, total: totalData }}
            onClick={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
