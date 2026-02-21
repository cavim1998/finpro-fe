import OrderCard from "@/components/admin/card/OrderCard";
import PaginationSection from "@/components/PaginationSection";
import { FilterToolbar } from "./OrderListView/FilterToolbar";
import { PickupListItem } from "./OrderListView/PickupListItem";
import { LoadingState, EmptyState } from "./OrderListView/StateViews";
import { OrderListViewProps } from "@/types/order-list";

export const OrderListView = (props: OrderListViewProps) => {
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
  } = props;

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

      <FilterToolbar {...props} />

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

      {totalData > 0 && (
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
