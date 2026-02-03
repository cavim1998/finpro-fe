"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Store, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useCreateOutlet, useUpdateOutlet } from "@/hooks/useOutlet";
import { outletSchema, OutletFormData } from "@/lib/schema/outlet.schema";
import { FormInput } from "@/components/FormInput";
import { CoordinateDisplay } from "@/components/CoordinateDisplay";

const LocationPicker = dynamic(() => import("@/components/ui/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-50 w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm border rounded-lg">
      Memuat Peta...
    </div>
  ),
});

interface CreateOutletModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export default function CreateOutletModal({
  isOpen,
  onClose,
  initialData,
}: CreateOutletModalProps) {
  const createMutation = useCreateOutlet();
  const updateMutation = useUpdateOutlet();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<OutletFormData>({
    resolver: zodResolver(outletSchema),
    defaultValues: {
      name: "",
      addressText: "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  const [lat, lng] = watch(["latitude", "longitude"]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          addressText: initialData.addressText || initialData.address,
          latitude: Number(initialData.latitude),
          longitude: Number(initialData.longitude),
        });
      } else {
        reset({
          name: "",
          addressText: "",
          latitude: undefined,
          longitude: undefined,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = (data: OutletFormData) => {
    const options = {
      onSuccess: () => {
        toast.success(initialData ? "Outlet diperbarui!" : "Outlet dibuat!");
        onClose();
      },
      onError: (err: any) =>
        toast.error(err?.response?.data?.error || "Gagal menyimpan data"),
    };

    initialData
      ? updateMutation.mutate({ id: initialData.id, data }, options)
      : createMutation.mutate(data, options);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-50 p-3 rounded-full text-[#17A2B8]">
            <Store size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {initialData ? "Edit Outlet" : "Outlet Baru"}
            </h2>
            <p className="text-sm text-gray-500">
              Kelola informasi cabang laundry
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="Nama Outlet"
            registration={register("name")}
            error={errors.name?.message}
            disabled={isPending}
            placeholder="Contoh: Chingu Cabang Binjai"
          />

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">
              Alamat Lengkap <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("addressText")}
              disabled={isPending}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] outline-none resize-none disabled:bg-gray-100"
              placeholder="Jl. Soekarno Hatta..."
            />
            {errors.addressText && (
              <p className="text-xs text-red-500">
                {errors.addressText.message}
              </p>
            )}
          </div>

          <div className={isPending ? "opacity-50 pointer-events-none" : ""}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pin Lokasi <span className="text-red-500">*</span>
            </label>
            <LocationPicker
              defaultPosition={initialData && lat ? [lat, lng] : undefined}
              onLocationSelect={(lat, lng) => {
                setValue("latitude", lat, { shouldValidate: true });
                setValue("longitude", lng, { shouldValidate: true });
              }}
            />
            {errors.latitude && (
              <p className="text-xs text-red-500 mt-1">
                Lokasi wajib dipilih di peta.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <CoordinateDisplay label="Latitude" value={lat} />
            <CoordinateDisplay label="Longitude" value={lng} />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-[#17A2B8] text-white rounded-lg font-bold hover:bg-[#138496] shadow-lg shadow-[#17A2B8]/20 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : initialData ? (
                "Simpan"
              ) : (
                "Buat Outlet"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
