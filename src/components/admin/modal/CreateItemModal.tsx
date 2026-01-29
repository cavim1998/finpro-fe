'use client';

import { X, Shirt } from 'lucide-react';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateItemModal({ isOpen, onClose }: CreateItemModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        
        {/* Tombol Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        
        {/* Header Modal */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-50 p-3 rounded-full text-orange-500">
            <Shirt size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Tambah Item Laundry</h2>
            <p className="text-sm text-gray-500">Daftarkan jenis pakaian baru</p>
          </div>
        </div>

        {/* Form Input */}
        <form className="space-y-4">
          
          {/* Input Nama Item */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nama Item <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] outline-none" 
              placeholder="Contoh: Gamis, Jas, Selimut..." 
            />
          </div>

          {/* Input Satuan (Dropdown) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Satuan Unit <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] outline-none appearance-none bg-white text-gray-700">
                <option value="Pcs">Pcs (Satuan)</option>
                <option value="Kg">Kg (Kiloan)</option>
                <option value="Meter">Meter (Karpet/Gorden)</option>
                <option value="Set">Set (Sepasang)</option>
              </select>
              {/* Custom Arrow Icon */}
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">Pilih 'Pcs' untuk laundry satuan umum.</p>
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
              type="button" 
              className="flex-1 py-2.5 bg-[#17A2B8] text-white rounded-lg font-bold hover:bg-[#138496] shadow-lg shadow-[#17A2B8]/20"
            >
              Simpan Item
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}