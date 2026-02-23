"use client";

import { X, Briefcase, Loader2, UserPlus } from "lucide-react";
import { useAssignEmployeeForm } from "./AssignEmployeeModal/useAssignEmployeeForm";
import { Employee } from "@/types/employee";
import { formatTime } from "@/lib/datetime";

interface AssignEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Employee;
}

export default function AssignEmployeeModal(props: AssignEmployeeModalProps) {
  const { isOpen, onClose, initialData } = props;

  // Panggil Logic dari Hook
  const { form, onSubmit, isEditMode, isPending, data, uiState } =
    useAssignEmployeeForm(props);
  const {
    register,
    formState: { errors },
  } = form;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-50 p-3 rounded-full text-purple-600">
            {isEditMode ? <Briefcase size={24} /> : <UserPlus size={24} />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isEditMode ? "Edit Penugasan" : "Assign Pegawai"}
            </h2>
            <p className="text-sm text-gray-500">
              {isEditMode
                ? "Ubah outlet atau jadwal shift pegawai"
                : "Pilih outlet dan jadwal shift yang sudah dibuat"}
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Pegawai{" "}
              {isEditMode ? "" : <span className="text-red-500">*</span>}
            </label>

            {isEditMode ? (
              <div className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg text-gray-600 font-medium cursor-not-allowed">
                {initialData?.user.profile.fullName || "Nama Pegawai"}
                <span className="text-xs text-gray-400 ml-2">
                  ({initialData?.user.email})
                </span>
              </div>
            ) : (
              <select
                {...register("userId")}
                className="w-full border border-gray-300 p-2 rounded-lg bg-white focus:ring-2 focus:ring-[#17A2B8] outline-none"
              >
                <option value="">-- Pilih User --</option>
                {data.userOptions.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            )}

            {errors.userId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.userId.message}
              </p>
            )}

            {isEditMode && (
              <p className="text-[10px] text-gray-400 mt-1 italic">
                * Pegawai tidak dapat diganti saat mode edit.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Jabatan
              </label>
              <select
                {...register("role")}
                className="w-full border border-gray-300 p-2 rounded-lg bg-white focus:ring-2 focus:ring-[#17A2B8] outline-none"
              >
                <option value="WORKER">Worker</option>
                <option value="DRIVER">Driver</option>
                <option value="OUTLET_ADMIN">Outlet Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Penempatan
              </label>
              <select
                {...register("outletId")}
                className="w-full border border-gray-300 p-2 rounded-lg bg-white focus:ring-2 focus:ring-[#17A2B8] outline-none"
              >
                <option value="0">-- Pilih Outlet --</option>
                {data.outlets &&
                  data.outlets.data.map((o: any) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
              </select>
              {errors.outletId && (
                <p className="text-red-500 text-xs mt-1">Wajib pilih outlet</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Pilih Jadwal Shift
            </label>
            <select
              {...register("shiftTemplateId")}
              disabled={data.shifts && !data.shifts.data.length}
              className="w-full border border-gray-300 p-2 rounded-lg bg-white disabled:bg-gray-100 focus:ring-2 focus:ring-[#17A2B8] outline-none"
            >
              <option value="0">-- Pilih Shift --</option>
              {data.shifts &&
                data.shifts.data.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({formatTime(s.startTime)} -{" "}
                    {formatTime(s.endTime)})
                  </option>
                ))}
            </select>

            {uiState.isLoadingShifts && (
              <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> Memuat jadwal
                shift...
              </p>
            )}

            {uiState.hasOutletButNoShift && (
              <div className="mt-2 p-2 bg-orange-50 border border-orange-100 rounded text-xs text-orange-600 flex flex-col gap-1">
                <span className="font-bold">
                  ⚠️ Outlet ini belum memiliki Master Shift.
                </span>
                <span>
                  Silakan buat jadwal terlebih dahulu di menu "Master Shift".
                </span>
              </div>
            )}

            {errors.shiftTemplateId && (
              <p className="text-red-500 text-xs mt-1">Wajib pilih shift</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#17A2B8] text-white py-3 rounded-lg font-bold hover:bg-[#138496] transition-colors shadow-lg shadow-[#17A2B8]/20 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isEditMode ? (
              "Simpan Perubahan"
            ) : (
              "Simpan Penugasan"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
