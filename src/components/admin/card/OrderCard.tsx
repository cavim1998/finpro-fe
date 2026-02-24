import { Order } from "@/types";
import { FileText, MoreVertical, CreditCard } from "lucide-react";
import React from "react";
// Pastikan path import ini sesuai dengan lokasi helper currency Anda
import { formatRupiah } from "@/lib/currency";

interface OrderCardProps {
  // Kita extend tipe Order karena properti isPaid & itemCount adalah tambahan dari backend
  order: Order & { isPaid?: boolean; itemCount?: number };
  onViewDetail?: (id: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onViewDetail }) => {
  // Helper warna status order
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "RECEIVED_BY_CUSTOMER":
        return "bg-green-100 text-green-700 border-green-200";
      case "WASHING":
      case "IRONING":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "ARRIVED_AT_OUTLET":
      case "PACKING":
      case "READY_TO_DELIVER":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "CANCELED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-[#17A2B8] hover:shadow-md transition-all group flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            {/* Order No (Lebih penting daripada UUID) */}
            <h3 className="font-bold text-gray-800 text-lg">{order.orderNo}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              ID: {order.id.substring(0, 8)}...
            </p>
          </div>

          {/* Badge Status Order */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}
          >
            {order.status.replace(/_/g, " ")}
          </span>
        </div>

        {/* Info Customer */}
        <div className="mb-3">
          <p className="text-sm text-gray-600 font-medium">
            <span className="text-gray-400 font-normal">Customer:</span>{" "}
            {order.customer?.profile?.fullName || `User #${order.customerId}`}
          </p>
        </div>

        {/* Statistik Items & Berat */}
        <div className="flex gap-4 text-sm text-gray-500 border-t border-gray-50 pt-3">
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
            <FileText size={14} className="text-gray-400" />
            <span className="font-medium text-gray-700">
              {order.itemCount || 0}
            </span>{" "}
            Items
          </div>
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
            <MoreVertical size={14} className="text-gray-400" />
            <span className="font-medium text-gray-700">
              {order.totalWeightKg}
            </span>{" "}
            Kg
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between items-end min-w-40 border-l border-dashed border-gray-200 pl-4 md:border-l-0 md:pl-0 md:border-t-0">
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-1">Total Tagihan</p>
          <h3 className="text-xl font-bold text-[#17A2B8]">
            {formatRupiah(Number(order.totalAmount))}
          </h3>

          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold mt-1 ${
              order.isPaid
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-red-50 text-red-600 border border-red-100"
            }`}
          >
            <CreditCard size={10} />
            {order.isPaid ? "LUNAS" : "BELUM BAYAR"}
          </div>
        </div>

        <button
          onClick={() => onViewDetail && onViewDetail(order.id)}
          className="w-full mt-4 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-[#17A2B8] hover:text-white hover:border-[#17A2B8] transition-colors"
        >
          Lihat Detail
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
