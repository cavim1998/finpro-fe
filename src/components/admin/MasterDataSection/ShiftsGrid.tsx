"use client";

import { formatTime } from "@/lib/datetime";
import { ShiftListTypes } from "@/types/shift";
import { Clock, Trash2, Plus, Store } from "lucide-react";

interface ShiftsGridProps {
  data: ShiftListTypes[];
  onCreate: () => void;
  onDelete: (id: number) => void;
}

export const ShiftsGrid = ({ data, onCreate, onDelete }: ShiftsGridProps) => {
  return (
    <div>
      <div className="flex justify-between mb-6">
        <h3 className="font-bold text-lg">Master Jadwal Shift</h3>
        <button
          onClick={onCreate}
          className="bg-[#17A2B8] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-[#138496]"
        >
          <Plus size={16} /> Tambah Shift
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((shift) => (
          <div
            key={shift.id}
            className="border border-gray-200 rounded-xl p-4 hover:shadow-md bg-white relative group"
          >
            <button
              onClick={() => onDelete(shift.id)}
              className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={18} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-50 p-2.5 rounded-lg text-green-600">
                <Clock size={20} />
              </div>
              <h4 className="font-bold text-gray-800">{shift.name}</h4>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between border-b pb-2">
                <span>Jam Masuk:</span>
                <span className="font-mono font-bold">
                  {formatTime(shift.startTime)}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Jam Keluar:</span>
                <span className="font-mono font-bold">
                  {formatTime(shift.endTime)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 pt-1">
                <Store size={14} /> <span>Outlet: {shift.outlet.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
