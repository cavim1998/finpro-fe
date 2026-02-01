"use client";

import React, { useState, useEffect } from "react";
import { X, MapPin, Store, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("@/components/ui/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-75 w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm rounded-lg border">
      <Loader2 className="animate-spin mr-2" size={20} /> Memuat Peta...
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
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Mode Edit: Isi form dengan data yang dikirim
        setFormData({
          name: initialData.name || "",
          address: initialData.address || "",
          latitude: initialData.latitude ? String(initialData.latitude) : "",
          longitude: initialData.longitude ? String(initialData.longitude) : "",
        });
      } else {
        // Mode Create: Reset form jadi kosong
        setFormData({ name: "", address: "", latitude: "", longitude: "" });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEditMode = !!initialData;

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Data Outlet:", formData);
    alert(
      `Outlet "${formData.name}" disimpan dengan lokasi: ${formData.latitude}, ${formData.longitude}`,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200 my-8">
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-50 p-3 rounded-full text-[#17A2B8]">
            <Store size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isEditMode ? "Edit Data Outlet" : "Tambah Outlet Baru"}
            </h2>
            <p className="text-sm text-gray-500">
              {isEditMode
                ? "Perbarui informasi cabang"
                : "Isi detail lokasi cabang laundry"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Outlet */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nama Outlet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] outline-none"
              placeholder="Contoh: Laundry Cabang Tangerang"
            />
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Alamat Lengkap <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] outline-none resize-none"
              placeholder="Jl. Soekarno Hatta No. 123..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pin Lokasi Peta <span className="text-red-500">*</span>
            </label>
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              defaultPosition={
                isEditMode && formData.latitude
                  ? [Number(formData.latitude), Number(formData.longitude)]
                  : undefined
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Klik pada peta untuk menentukan titik koordinat otomatis.
            </p>
          </div>

          {/* Koordinat (Read Only - Terisi dari Peta) */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Latitude
              </label>
              <div className="relative">
                <MapPin
                  size={14}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  readOnly
                  value={formData.latitude}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 focus:outline-none"
                  placeholder="Klik peta..."
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Longitude
              </label>
              <div className="relative">
                <MapPin
                  size={14}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  readOnly
                  value={formData.longitude}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 focus:outline-none"
                  placeholder="Klik peta..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!formData.latitude}
              className="flex-1 py-2.5 bg-[#17A2B8] text-white rounded-lg font-bold hover:bg-[#138496] shadow-lg shadow-[#17A2B8]/20 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {isEditMode ? "Simpan Perubahan" : "Simpan Outlet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
