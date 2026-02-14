import { useState } from "react";
import {
  Check,
  X,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { decisionBypass } from "@/services/bypass.service";

interface BypassListItemProps {
  item: any;
  onRefresh: () => void;
}

export const BypassListItem = ({ item, onRefresh }: BypassListItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleDecision = async (action: "APPROVE" | "REJECT") => {
    if (action === "REJECT" && !adminNote.trim()) {
      return toast.warning("Wajib isi alasan penolakan!");
    }

    setProcessing(true);
    try {
      await decisionBypass(item.id, action, adminNote);
      toast.success(
        `Request berhasil di-${action === "APPROVE" ? "setujui" : "tolak"}`,
      );
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal memproses");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-50 text-green-700 border-green-200";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-300 ${expanded ? "border-blue-300 ring-1 ring-blue-100 shadow-md" : "border-gray-200 hover:border-blue-200 shadow-sm"}`}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-5 cursor-pointer flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center"
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
              {item.orderStation?.order?.orderNo || "Unknown Order"}
            </span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded border ${getStatusColor(item.status)}`}
            >
              {item.status}
            </span>
            <span className="text-xs font-bold bg-orange-50 text-orange-600 px-2 py-1 rounded border border-orange-100">
              Station: {item.orderStation?.stationType}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">
                {item.requestedBy?.profile?.fullName || item.requestedBy?.email}
              </h3>
              <div className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                <MapPin size={12} /> {item.orderStation?.order?.outlet?.name}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg">
            <Clock size={14} />{" "}
            {new Date(item.createdAt).toLocaleString("id-ID")}
          </div>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* EXPANDED DETAILS */}
      {expanded && (
        <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2">
          <div className="h-px bg-gray-100 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-100 mb-4">
                <p className="text-xs font-bold text-red-500 mb-1">
                  ALASAN WORKER:
                </p>
                <p className="text-sm text-gray-700 italic">"{item.reason}"</p>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2 text-center">Sistem</th>
                      <th className="px-3 py-2 text-center">Fisik</th>
                      <th className="px-3 py-2 text-center">Selisih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {item.diffs?.map((diff: any) => (
                      <tr key={diff.id}>
                        <td className="px-3 py-2 font-medium">
                          {diff.item?.name}
                        </td>
                        <td className="px-3 py-2 text-center text-gray-400">
                          {diff.prevQty}
                        </td>
                        <td className="px-3 py-2 text-center font-bold text-blue-600">
                          {diff.currentQty}
                        </td>
                        <td className="px-3 py-2 text-center font-bold text-red-500">
                          {diff.currentQty - diff.prevQty}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              {item.status === "REQUESTED" ? (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 h-full">
                  <label className="text-xs font-bold text-gray-500 mb-2 block">
                    Catatan Admin / Manajer:
                  </label>
                  <textarea
                    className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none mb-4 h-24 resize-none"
                    placeholder="Tulis alasan persetujuan atau penolakan..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                  ></textarea>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDecision("REJECT")}
                      disabled={processing}
                      className="flex-1 py-2 rounded-lg border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {processing ? "..." : "TOLAK"}
                    </button>
                    <button
                      onClick={() => handleDecision("APPROVE")}
                      disabled={processing}
                      className="flex-1 py-2 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {processing ? "..." : "SETUJUI"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 h-full flex flex-col justify-center items-center text-center">
                  <div
                    className={`p-3 rounded-full mb-2 ${item.status === "APPROVED" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                  >
                    {item.status === "APPROVED" ? (
                      <Check size={24} />
                    ) : (
                      <X size={24} />
                    )}
                  </div>
                  <h4 className="font-bold text-gray-800">
                    Request{" "}
                    {item.status === "APPROVED" ? "Disetujui" : "Ditolak"}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Oleh: {item.approvedBy?.profile?.fullName || "Admin"}
                  </p>
                  {item.adminNote && (
                    <p className="text-sm text-gray-600 mt-2 bg-white p-2 rounded border border-gray-200 italic">
                      "{item.adminNote}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
