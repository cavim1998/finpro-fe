import React from "react";
import { AlertTriangle } from "lucide-react";

export const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-20 space-y-4">
    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
    <div className="text-gray-400 text-sm">Memuat data bypass...</div>
  </div>
);

export const EmptyState = () => (
  <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200 flex flex-col items-center">
    <div className="p-4 bg-gray-50 rounded-full mb-3">
      <AlertTriangle className="text-gray-300" size={32} />
    </div>
    <h3 className="text-gray-800 font-medium">Tidak ada data request</h3>
    <p className="text-sm text-gray-400">
      Belum ada permintaan bypass yang sesuai dengan filter ini.
    </p>
  </div>
);
