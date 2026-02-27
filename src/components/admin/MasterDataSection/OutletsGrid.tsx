"use client";

import { OutletListTypes } from "@/types/outlet";
import { Edit, Trash2, Store, MapPin, Plus, Users } from "lucide-react";

interface OutletsGridProps {
  data: OutletListTypes[];
  onCreate: () => void;
  onDelete: (id: number) => void;
  onEdit: (outlet: any) => void;
}

export const OutletsGrid = ({
  data,
  onCreate,
  onDelete,
  onEdit,
}: OutletsGridProps) => {
  return (
    <div>
      <div className="flex justify-between mb-6">
        <h3 className="font-bold text-lg">Outlet List</h3>
        <button
          onClick={onCreate}
          className="bg-[#17A2B8] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-[#138496] shadow-sm"
        >
          <Plus size={16} /> Create Outlet
        </button>
      </div>

      {/* Handle jika data kosong */}
      {data.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
          <div className="bg-gray-100 p-4 rounded-full inline-block mb-3">
            <Store className="text-gray-400" size={32} />
          </div>
          <h4 className="text-gray-600 font-medium">Belum ada outlet</h4>
          <p className="text-sm text-gray-400 mb-4">
            Silakan buat outlet pertama Anda
          </p>
          <button
            onClick={onCreate}
            className="text-[#17A2B8] text-sm font-bold hover:underline"
          >
            + Tambah Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((o) => (
            <div
              key={o.id}
              className="border border-gray-200 rounded-xl p-4 hover:border-[#17A2B8] hover:shadow-md transition-all group bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-[#17A2B8]">
                    <Store size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 line-clamp-1">
                      {o.name}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full w-fit mt-1">
                      <Users size={10} />
                      <span>{o._count?.staff || 0} Staff</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(o)}
                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                    title="Edit Outlet"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(o.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                    title="Hapus Outlet"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-500 flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                  <span className="line-clamp-2">{o.addressText}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
