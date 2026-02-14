import PaginationSection from "@/components/PaginationSection";
import { FilterToolbar } from "./BypassListView/FilterToolbar";
import { BypassListItem } from "./BypassListView/BypassListItem";
import { LoadingState, EmptyState } from "./BypassListView/StateViews";
import { BypassListViewProps } from "@/types/bypass";

export default function BypassListView(props: BypassListViewProps) {
  const { data, loading, page, limit, totalData, onPageChange } = props;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bypass Requests</h1>
        <p className="text-sm text-gray-500">
          Manajemen permintaan perubahan stok manual dari stasiun kerja.
        </p>
      </div>

      <FilterToolbar {...props} />

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

      {totalData > 0 && (
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
