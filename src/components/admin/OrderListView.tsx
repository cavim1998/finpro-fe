import OrderCard from "@/components/admin/card/OrderCard";
import PaginationSection from "@/components/PaginationSection";
import { FilterToolbar } from "./OrderListView/FilterToolbar";
import { PickupListItem } from "./OrderListView/PickupListItem";
import { LoadingState, EmptyState } from "./OrderListView/StateViews";
import { OrderListViewProps } from "@/types/order-list";
import { useDebounce } from "@/hooks/use-debunce";
import { useEffect, useState } from "react";

interface ExtendedOrderListViewProps extends OrderListViewProps {
  outlets?: any[];
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  outletId?: number;
  onOutletChange: (val: number | undefined) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (val: "asc" | "desc") => void;
  isOrderCreated?: string;
  onIsOrderCreatedChange?: (val: string) => void;
}

export const OrderListView = (props: ExtendedOrderListViewProps) => {
  const {
    title,
    isPickupTab,
    data,
    loading,
    page,
    limit,
    totalData,
    onPageChange,
    roleCode,
    onCreateOrder,
    selectedOutletId,
    onViewDetail,
    search,
    onSearchChange,
  } = props;

  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    if (debouncedSearch !== search) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500">
            {roleCode === "SUPER_ADMIN"
              ? "Administrator Mode: Full Access"
              : "Outlet Admin Mode: Restricted Access"}
          </p>
        </div>
      </div>

      <FilterToolbar
        {...props}
        selectedOutletId={props.outletId}
        onOutletChange={props.onOutletChange}
        selectedStatus={props.status}
        onStatusChange={props.onStatusChange}
        sortBy={props.sortBy}
        onSortByChange={props.onSortByChange}
        sortOrder={props.sortOrder}
        onSortOrderChange={props.onSortOrderChange}
        search={localSearch}
        onSearchChange={setLocalSearch}
        isOrderCreated={props.isOrderCreated}
        onIsOrderCreatedChange={props.onIsOrderCreatedChange}
      />

      <div className="space-y-4 min-h-75">
        {loading ? (
          <LoadingState />
        ) : !data || data.length === 0 ? (
          <EmptyState roleCode={roleCode} selectedOutletId={selectedOutletId} />
        ) : (
          data.map((item) =>
            isPickupTab ? (
              <PickupListItem
                key={item.id}
                item={item}
                onCreateOrder={onCreateOrder}
              />
            ) : (
              <OrderCard
                key={item.id}
                order={item}
                onViewDetail={onViewDetail}
              />
            ),
          )
        )}
      </div>

      {totalData > limit && (
        <div className="mt-8 flex justify-center">
          <PaginationSection
            meta={{
              page: page,
              take: limit,
              total: totalData,
            }}
            onClick={(newPage) => onPageChange(newPage)}
          />
        </div>
      )}
    </div>
  );
};
