import { Search } from "lucide-react";

export const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-20 space-y-4">
    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
    <div className="text-gray-400 text-sm animate-pulse">
      Sedang memuat data...
    </div>
  </div>
);

interface EmptyStateProps {
  roleCode?: string;
  selectedOutletId?: number;
}

export const EmptyState = ({ roleCode, selectedOutletId }: EmptyStateProps) => (
  <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200 flex flex-col items-center">
    <div className="p-4 bg-gray-50 rounded-full mb-3">
      <Search className="text-gray-300" size={32} />
    </div>
    <h3 className="text-gray-800 font-medium mb-1">Tidak ada data ditemukan</h3>
    <p className="text-sm text-gray-400 max-w-xs mx-auto mb-4">
      Data yang Anda cari tidak tersedia atau belum ada transaksi yang masuk.
    </p>
    {roleCode === "SUPER_ADMIN" && !selectedOutletId && (
      <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-100">
        💡 Tips: Silakan pilih Outlet terlebih dahulu pada filter di atas.
      </div>
    )}
  </div>
);
