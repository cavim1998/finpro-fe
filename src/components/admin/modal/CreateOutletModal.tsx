'use client';

import { X, MapPin, Store } from 'lucide-react';

interface CreateOutletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateOutletModal({ isOpen, onClose }: CreateOutletModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-50 p-3 rounded-full text-[#17A2B8]">
            <Store size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Tambah Outlet Baru</h2>
            <p className="text-sm text-gray-500">Isi detail lokasi cabang laundry</p>
          </div>
        </div>

        <form className="space-y-4">
          {/* Nama Outlet */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Outlet <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] outline-none" 
              placeholder="Contoh: Laundry Cabang Tangerang" 
            />
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat Lengkap <span className="text-red-500">*</span></label>
            <textarea 
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] outline-none resize-none" 
              placeholder="Jl. Soekarno Hatta No. 123..." 
            />
          </div>

          {/* Koordinat (Sesuai Requirement Feature 2: Menentukan titik lokasi) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Latitude</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] outline-none" 
                  placeholder="-6.200000" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Longitude</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] outline-none" 
                  placeholder="106.816666" 
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
            >
              Batal
            </button>
            <button 
              type="button" 
              className="flex-1 py-2.5 bg-[#17A2B8] text-white rounded-lg font-bold hover:bg-[#138496] shadow-lg shadow-[#17A2B8]/20"
            >
              Simpan Outlet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}