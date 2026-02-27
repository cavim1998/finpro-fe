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

const DetailView = ({ data }: { data: any }) => (
  <div className="space-y-4">
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
            Rp {item.price * item.qty}
          </span>
        </div>
      ))}
      <div className="flex justify-between font-bold text-blue-600 border-t pt-2 mt-2">
        <span>Total Akhir</span>
        <span>Rp {data.totalAmount}</span>
      </div>
    </div>
  </div>
);

const TrackView = ({ data }: { data: any }) => (
  <div className="space-y-3 relative border-l-2 border-blue-100 ml-3 pl-4">
    {data.stations?.map((st: any, idx: number) => (
      <div key={idx} className="relative">
        <div className="absolute -left-5.75 top-1 w-3 h-3 bg-blue-500 rounded-full"></div>
        <p className="text-sm font-bold text-gray-800">{st.stationType}</p>
        <p className="text-xs text-gray-500">Status: {st.status}</p>
        <p className="text-xs text-gray-400">
          Pekerja: {st.worker?.profile?.fullName || "Belum diassign"}
        </p>
      </div>
    ))}
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
