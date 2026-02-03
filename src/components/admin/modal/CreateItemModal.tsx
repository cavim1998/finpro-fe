"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Shirt, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useCreateItem, useUpdateItem } from "@/hooks/api/useLaundryItem";
import {
  laundryItemSchema,
  LaundryItemFormData,
} from "@/lib/schema/laundry-item.schema";
import { FormInput } from "@/components/FormInput";

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export default function CreateItemModal({
  isOpen,
  onClose,
  initialData,
}: CreateItemModalProps) {
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(laundryItemSchema),
    defaultValues: {
      name: "",
      price: 0,
      unit: "PCS",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          price: initialData.price,
          unit: initialData.unit || "PCS",
        });
      } else {
        reset({ name: "", price: 0, unit: "PCS" });
      }
    }
  }, [isOpen, initialData, reset]);

  // Kita beri tipe manual di sini agar intellisense tetap jalan
  const onSubmit = (data: LaundryItemFormData) => {
    const options = {
      onSuccess: () => {
        toast.success(
          initialData
            ? "Item berhasil diperbarui"
            : "Item berhasil ditambahkan",
        );
        onClose();
      },
      onError: (err: any) =>
        toast.error(err?.response?.data?.error || "Gagal menyimpan item"),
    };

    if (initialData) {
      updateMutation.mutate({ id: initialData.id, data }, options);
    } else {
      createMutation.mutate(data, options);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-50 p-3 rounded-full text-orange-500">
            <Shirt size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {initialData ? "Edit Item" : "Tambah Item Laundry"}
            </h2>
            <p className="text-sm text-gray-500">Atur harga dan nama layanan</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="Nama Item"
            registration={register("name")}
            error={errors.name?.message as string} // Casting string agar aman
            placeholder="Contoh: Baju Kaos / Kemeja"
            disabled={isPending}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Harga (Rp)"
              type="number"
              registration={register("price")}
              error={errors.price?.message as string}
              placeholder="5000"
              disabled={isPending}
            />

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">
                Satuan
              </label>
              <input
                value="PCS"
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
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
                "Simpan Perubahan"
              ) : (
                "Simpan Item"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
