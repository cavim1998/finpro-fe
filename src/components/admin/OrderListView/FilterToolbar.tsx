import { Search, ArrowUpDown, Filter } from "lucide-react";
import { OrderListViewProps } from "@/types/order-list";

interface ToolbarProps extends Pick<
  OrderListViewProps,
  | "roleCode"
  | "selectedOutletId"
  | "onOutletChange"
  | "selectedStatus"
  | "onStatusChange"
  | "isPickupTab"
  | "sortBy"
  | "onSortByChange"
  | "sortOrder"
  | "onSortOrderChange"
> {
  outlets?: any[];
  search: string;
  onSearchChange: (val: string) => void;
  isOrderCreated?: string;
  onIsOrderCreatedChange?: (val: string) => void;
}

export const FilterToolbar = ({
  roleCode,
  selectedOutletId,
  onOutletChange,
  selectedStatus,
  onStatusChange,
  isPickupTab,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  outlets = [],
  search,
  onSearchChange,
  isOrderCreated,
  onIsOrderCreatedChange,
}: ToolbarProps) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
      <div className="flex flex-wrap gap-3 w-full xl:w-auto">
        {roleCode === "SUPER_ADMIN" && onOutletChange && (
          <div className="relative w-full sm:w-auto">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <Filter size={14} />
            </span>
            <select
              value={selectedOutletId || ""}
              onChange={(e) => onOutletChange(Number(e.target.value))}
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none bg-white cursor-pointer hover:border-blue-300 w-full"
            >
              <option value="">Semua Outlet</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {onStatusChange && (
          <select
            value={selectedStatus || ""}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none bg-white cursor-pointer w-full sm:w-auto"
          >
            <option value="">Semua Status</option>
            {isPickupTab ? (
              <>
                <option value="WAITING_DRIVER">Menunggu Driver</option>
                <option value="DRIVER_ASSIGNED">Driver Menjemput</option>
                <option value="PICKED_UP">Diambil</option>
                <option value="ARRIVED_OUTLET">Sampai di Outlet</option>
                <option value="CANCELED">Batal</option>
              </>
            ) : (
              <>
                <option value="ARRIVED_AT_OUTLET">Baru Masuk</option>
                <option value="WASHING">Sedang Dicuci</option>
                <option value="IRONING">Sedang Disetrika</option>
                <option value="PACKING">Packing</option>
                <option value="READY_TO_DELIVER">Siap Antar</option>
                <option value="DELIVERING_TO_CUSTOMER">Sedang Antar</option>
                <option value="RECEIVED_BY_CUSTOMER">Selesai Antar</option>
                <option value="CANCELED">Batal</option>
              </>
            )}
          </select>
        )}

        {isPickupTab && onIsOrderCreatedChange && (
          <select
            value={isOrderCreated || ""}
            onChange={(e) => onIsOrderCreatedChange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none bg-white cursor-pointer w-full sm:w-auto"
          >
            <option value="">Semua Proses</option>
            <option value="false">Belum Diproses (Perlu Order)</option>
            <option value="true">Sudah Diproses (Ada Order)</option>
          </select>
        )}

        <div className="flex border border-gray-200 rounded-lg overflow-hidden w-full sm:w-auto">
          <select
            value={sortBy || "createdAt"}
            onChange={(e) => onSortByChange && onSortByChange(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 border-r border-gray-200 focus:outline-none cursor-pointer hover:bg-gray-100"
          >
            <option value="createdAt">Tanggal</option>
            {!isPickupTab && <option value="totalAmount">Harga</option>}
          </select>

          <button
            onClick={() =>
              onSortOrderChange &&
              onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
            }
            className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-600 flex items-center gap-1 text-sm min-w-25 justify-between transition-colors"
            title="Klik untuk balik urutan"
          >
            {sortOrder === "asc" ? "Terlama" : "Terbaru"}
            <ArrowUpDown size={14} />
          </button>
        </div>
      </div>

      <div className="relative w-full xl:w-64">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            isPickupTab ? "Cari Pelanggan..." : "Cari Order ID / Nama..."
          }
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
        />
      </div>
    </div>
  );
};
