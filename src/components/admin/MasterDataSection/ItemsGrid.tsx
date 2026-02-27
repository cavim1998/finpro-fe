"use client";

import { Edit, Trash2, Shirt, Tag, ShoppingBag, Plus } from "lucide-react";
import { LaundryItemTypes } from "@/types/laundry-item";
import { formatRupiah } from "@/lib/currency";

interface ItemsGridProps {
  data: LaundryItemTypes[];
  onCreate: () => void;
  onDelete: (id: number) => void;
  onEdit: (item: LaundryItemTypes) => void;
}

export const ItemsGrid = ({
  data,
  onCreate,
  onDelete,
  onEdit,
}: ItemsGridProps) => {
  return (
    <div>
      <div className="flex justify-between mb-6">
        <h3 className="font-bold text-lg">Daftar Item & Layanan</h3>
        <button
          onClick={onCreate}
          className="bg-[#17A2B8] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-[#138496] shadow-sm transition-all"
        >
          <Plus size={16} /> Tambah Item
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
          <div className="bg-gray-100 p-4 rounded-full inline-block mb-3">
            <Shirt className="text-gray-400" size={32} />
          </div>
          <h4 className="text-gray-600 font-medium">Belum ada item laundry</h4>
          <p className="text-sm text-gray-400 mb-4">
            Silakan tambah layanan pertama Anda
          </p>
          <button
            onClick={onCreate}
            className="text-[#17A2B8] text-sm font-bold hover:underline"
          >
            + Tambah Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-xl p-4 hover:border-[#17A2B8] hover:shadow-md transition-all group bg-white relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Header Card */}
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-orange-50 p-2.5 rounded-lg text-orange-500">
                    <Shirt size={20} />
                  </div>

                  {/* Action Buttons (Muncul saat hover) */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"
                      title="Edit Item"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                      title="Hapus Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Main Content */}
                <h4 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">
                  {item.name}
                </h4>

                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                  <Tag size={14} />
                  <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                    {formatRupiah(item.price)} / {item.unit}
                  </span>
                </div>
              </div>

              {/* STATISTIK ORDER (Footer) */}
              <div className="border-t border-gray-100 pt-3 mt-auto flex items-center gap-2 text-xs text-gray-400">
                <ShoppingBag size={12} />
                <span>
                  Total Order:{" "}
                  <b className="text-gray-600">{item.totalOrders || 0}</b> kali
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
