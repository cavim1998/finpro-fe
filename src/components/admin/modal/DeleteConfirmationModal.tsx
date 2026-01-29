'use client';

import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, itemName }: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative animate-in zoom-in duration-200 shadow-xl">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
            <AlertTriangle size={32} />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">Hapus Data Ini?</h2>
          <p className="text-sm text-gray-500 mb-6">
            Tindakan ini tidak dapat dibatalkan. Data <strong>{itemName || 'item ini'}</strong> akan hilang permanen dari database.
          </p>

          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Batal
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-600/20"
            >
              Ya, Hapus
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}