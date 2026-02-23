"use client";
import { useForm } from "react-hook-form";
import { useCreateShift } from "@/hooks/api/useShift";
import { useOutlets } from "@/hooks/api/useOutlet";
import { toast } from "sonner";
import { X, Clock } from "lucide-react";

export default function CreateShiftModal({ isOpen, onClose }: any) {
  const { register, handleSubmit, reset } = useForm();
  const createMutation = useCreateShift();
  const { data: outlets } = useOutlets();

  const onSubmit = (data: any) => {
    const mapData = {
      endTime: data.endTime,
      name: data.name,
      outletId: Number(data.outletId),
      startTime: data.startTime,
    };
    createMutation.mutate(mapData, {
      onSuccess: () => {
        toast.success("Master Shift berhasil dibuat");
        reset();
        onClose();
      },
      onError: () => toast.error("Gagal membuat shift"),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Clock className="text-blue-500" /> Tambah Master Shift
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Outlet</label>
            <select
              {...register("outletId")}
              className="w-full border p-2 rounded-lg"
            >
              {outlets?.data.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Nama Shift
            </label>
            <input
              {...register("name")}
              placeholder="Contoh: Shift Pagi"
              className="w-full border p-2 rounded-lg"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Jam Masuk
              </label>
              <input
                type="time"
                {...register("startTime")}
                className="w-full border p-2 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Jam Keluar
              </label>
              <input
                type="time"
                {...register("endTime")}
                className="w-full border p-2 rounded-lg"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-[#17A2B8] text-white py-2 rounded-lg font-bold"
          >
            Simpan Shift
          </button>
        </form>
      </div>
    </div>
  );
}
