import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface BypassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BypassModal: React.FC<BypassModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-0 overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom duration-300">
        
        {/* Header Alert */}
        <div className="bg-red-50 p-5 border-b border-red-100 flex gap-3">
          <div className="bg-red-100 p-2 rounded-full h-fit text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-red-700 text-lg">Bypass Request</h3>
            <p className="text-sm text-red-500">Station: Washing (Worker: Andi)</p>
          </div>
          <button onClick={onClose} className="ml-auto text-red-300 hover:text-red-500"><X/></button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 text-sm mb-2 font-medium">Masalah / Alasan:</p>
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 italic border border-gray-200 mb-6">
            "Jumlah kaos fisik hanya ada 4, data di sistem tertulis 5. Mohon konfirmasi."
          </div>

          <div className="flex items-center justify-between mb-6 text-sm">
            <div className="text-center w-1/2 border-r border-gray-100">
              <p className="text-gray-400 text-xs uppercase mb-1">System Data</p>
              <p className="font-bold text-xl text-gray-800">5 <span className="text-xs font-normal">Pcs</span></p>
            </div>
            <div className="text-center w-1/2">
              <p className="text-gray-400 text-xs uppercase mb-1">Worker Input</p>
              <p className="font-bold text-xl text-red-600">4 <span className="text-xs font-normal">Pcs</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 text-sm">
              Tolak (Isi Ulang)
            </button>
            <button className="py-3 bg-[#17A2B8] text-white rounded-xl font-bold hover:bg-[#138496] text-sm">
              Setujui Bypass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BypassModal;