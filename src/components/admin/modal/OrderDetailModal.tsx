import { useState } from "react";
import { X } from "lucide-react";
import { useOrderDetail } from "./OrderDetailModal/useOrderDetail";

const TabNav = ({ tab, setTab }: { tab: string; setTab: any }) => (
  <div className="flex border-b border-gray-200 mb-4">
    <button
      onClick={() => setTab("DETAIL")}
      className={`px-4 py-2 text-sm font-bold ${tab === "DETAIL" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
    >
      Informasi Detail
    </button>
    <button
      onClick={() => setTab("TRACK")}
      className={`px-4 py-2 text-sm font-bold ${tab === "TRACK" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
    >
      Tracking Status
    </button>
  </div>
);

const DetailView = ({ data }: { data: any }) => {
  const getCompletionTime = (stationType: string) => {
    const station = data?.stations?.find(
      (s: any) => s.stationType === stationType,
    );

    if (station && station.status === "COMPLETED" && station.completedAt) {
      return new Date(station.completedAt).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "Belum Selesai";
  };

  return (
    <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
      <div className="bg-gray-50 p-3 rounded-lg text-sm">
        <p className="font-bold text-gray-700">
          Customer: {data.customer?.profile?.fullName || "N/A"}
        </p>
        <p className="text-gray-500">
          {data.pickupRequest?.address?.addressText}
        </p>
      </div>

      <div className="border rounded-lg p-3">
        <h4 className="font-bold text-sm mb-2 border-b pb-2">
          Item Cucian ({data.totalWeightKg} Kg)
        </h4>
        {data.items?.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between text-sm py-1">
            <span>
              {item.item?.name} x{item.qty}
            </span>
            <span className="font-bold text-gray-700">
              Rp {(item.price * item.qty).toLocaleString("id-ID")}
            </span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-blue-600 border-t pt-2 mt-2">
          <span>Total Akhir</span>
          <span>Rp {Number(data.totalAmount).toLocaleString("id-ID")}</span>
        </div>
      </div>

      <div className="border rounded-lg p-3">
        <h4 className="font-bold text-sm mb-3 border-b pb-2 text-gray-800">
          Status Pengerjaan
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 border rounded-md bg-blue-50 text-center">
            <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase">
              Washing
            </p>
            <p
              className={`text-sm font-bold ${getCompletionTime("WASHING") === "Belum Selesai" ? "text-gray-400 font-normal text-xs" : "text-blue-700"}`}
            >
              {getCompletionTime("WASHING")}
            </p>
          </div>
          <div className="p-2 border rounded-md bg-orange-50 text-center">
            <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase">
              Ironing
            </p>
            <p
              className={`text-sm font-bold ${getCompletionTime("IRONING") === "Belum Selesai" ? "text-gray-400 font-normal text-xs" : "text-orange-700"}`}
            >
              {getCompletionTime("IRONING")}
            </p>
          </div>
          <div className="p-2 border rounded-md bg-green-50 text-center">
            <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase">
              Packing
            </p>
            <p
              className={`text-sm font-bold ${getCompletionTime("PACKING") === "Belum Selesai" ? "text-gray-400 font-normal text-xs" : "text-green-700"}`}
            >
              {getCompletionTime("PACKING")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrackView = ({ data }: { data: any }) => (
  <div className="space-y-4 relative border-l-2 border-blue-200 ml-3 pl-5 py-2">
    {data.stations?.map((st: any, idx: number) => (
      <div key={idx} className="relative">
        <div
          className={`absolute -left-6.75 top-1 w-4 h-4 rounded-full border-2 border-white ${
            st.status === "COMPLETED"
              ? "bg-green-500"
              : st.status === "IN_PROGRESS"
                ? "bg-blue-500 animate-pulse"
                : "bg-gray-300"
          }`}
        ></div>

        <p className="text-sm font-bold text-gray-800">{st.stationType}</p>
        <p className="text-xs font-medium text-gray-500 mb-1">
          Status:{" "}
          <span
            className={
              st.status === "COMPLETED" ? "text-green-600" : "text-blue-600"
            }
          >
            {st.status}
          </span>
        </p>
        <p className="text-xs text-gray-500">
          Pekerja: {st.worker?.profile?.fullName || "Belum diassign"}
        </p>

        {st.completedAt && (
          <p className="text-xs text-gray-500 mt-1">
            Selesai:{" "}
            <span className="font-medium text-gray-700">
              {new Date(st.completedAt).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>
        )}
      </div>
    ))}
    {(!data.stations || data.stations.length === 0) && (
      <p className="text-sm text-gray-400">Belum ada data tracking stasiun.</p>
    )}
  </div>
);

export default function OrderDetailModal({ isOpen, onClose, orderId }: any) {
  const { data, loading } = useOrderDetail(orderId, isOpen);
  const [activeTab, setActiveTab] = useState("DETAIL");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg">Detail Pesanan {data?.orderNo}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-md"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 min-h-75">
          {loading || !data ? (
            <div className="text-center text-gray-400 py-10 animate-pulse">
              Memuat data...
            </div>
          ) : (
            <>
              <TabNav tab={activeTab} setTab={setActiveTab} />
              {activeTab === "DETAIL" ? (
                <DetailView data={data} />
              ) : (
                <TrackView data={data} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
