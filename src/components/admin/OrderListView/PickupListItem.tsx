import { MapPin, Calendar, User } from "lucide-react";

interface PickupItemProps {
  item: any;
  onCreateOrder?: (id: string) => void;
}

export const PickupListItem = ({ item, onCreateOrder }: PickupItemProps) => {
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "WAITING_DRIVER":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "DRIVER_ASSIGNED":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "ARRIVED_AT_OUTLET":
        return "bg-green-50 text-green-700 border-green-200";
      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CANCELED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const customerName =
    item.customer?.profile?.fullName ||
    item.customer?.email ||
    "Pelanggan Tanpa Nama";
  const addressText = item.address?.addressText
    ? item.address.addressText
    : typeof item.address === "string"
      ? item.address
      : "Alamat tidak tersedia";

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 hover:border-blue-300 transition-all shadow-sm group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#17A2B8]"></div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1 w-full">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono border border-gray-200">
              #{item.id.substring(0, 8)}
            </span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded border capitalize ${getStatusBadgeStyle(item.status)}`}
            >
              {item.status?.replace(/_/g, " ").toLowerCase()}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-blue-50 text-blue-500 rounded-lg">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">
                {customerName}
              </h3>
              <div className="text-sm text-gray-500 mt-1 flex items-start gap-1">
                <MapPin size={14} className="mt-0.5 text-gray-400 shrink-0" />
                <span className="line-clamp-2">{addressText}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-400 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
          <Calendar size={14} />
          {new Date(item.createdAt).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        <div className="w-full lg:w-auto">
          <button
            onClick={() => onCreateOrder && onCreateOrder(item.id)}
            disabled={item.status !== "ARRIVED_OUTLET" || !!item.order}
            className="w-full lg:w-auto text-white bg-[#17A2B8] font-bold text-sm px-6 py-3 rounded-lg hover:bg-[#138496] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {item.status === "COMPLETED" ? "Sudah Diproses" : "Process Pickup"}
          </button>
        </div>
      </div>
    </div>
  );
};
