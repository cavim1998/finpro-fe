import React from 'react';
import { X, Plus } from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X/></button>
        
        <h2 className="text-xl font-bold text-gray-800 mb-1">Create Order</h2>
        <p className="text-sm text-gray-500 mb-6">Based on Pickup #PCK-001</p>

        <form className="space-y-4">
          {/* Input 1: Total Berat (Wajib) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Total Berat (Kg) <span className="text-red-500">*</span></label>
            <div className="relative">
                <input type="number" className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] outline-none" placeholder="0.0" />
                <span className="absolute right-4 top-3 text-gray-400 text-sm">Kg</span>
            </div>
          </div>

          {/* Input 2: Detail Item (Wajib) */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Detail Quantity Item <span className="text-red-500">*</span></label>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
              {['Kemeja', 'Kaos', 'Celana Panjang', 'Jaket'].map((item) => (
                <div key={item} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                  <span className="text-sm text-gray-600">{item}</span>
                  <input type="number" className="w-16 text-center border border-gray-300 rounded p-1 text-sm" placeholder="0" />
                </div>
              ))}
            </div>
            <button type="button" className="mt-3 text-sm text-[#17A2B8] font-medium flex items-center gap-1">
              <Plus size={16}/> Add Custom Item
            </button>
          </div>

          <div className="pt-2">
            <button type="button" className="w-full bg-[#17A2B8] text-white py-3 rounded-xl font-bold hover:bg-[#138496]">
              Submit Order & Print Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal;