'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Briefcase } from 'lucide-react';

// Tipe data untuk form
interface EmployeeForm {
  name: string;
  email: string;
  role: 'OUTLET_ADMIN' | 'WORKER' | 'DRIVER';
  outletId: string;
  station?: 'WASHING' | 'IRONING' | 'PACKING';
}

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: EmployeeForm | null;
}

export default function CreateEmployeeModal({ isOpen, onClose, initialData }: CreateEmployeeModalProps) {
  // State Form
  const [formData, setFormData] = useState<EmployeeForm>({
    name: '',
    email: '',
    role: 'WORKER',
    outletId: '',
    station: 'WASHING'
  });

  // Effect: Isi form jika mode Edit
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset jika mode Add
      setFormData({ name: '', email: '', role: 'WORKER', outletId: '', station: 'WASHING' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isWorker = formData.role === 'WORKER';
  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-50 p-3 rounded-full text-purple-600">
            {isEditMode ? <Briefcase size={24}/> : <UserPlus size={24} />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}</h2>
            <p className="text-sm text-gray-500">{isEditMode ? 'Perbarui informasi pegawai' : 'Daftarkan pegawai ke outlet'}</p>
          </div>
        </div>

        <form className="space-y-4">
          {/* 1. Nama Lengkap */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] outline-none" 
              placeholder="Nama sesuai KTP"
            />
          </div>

          {/* 2. Email (Untuk Login) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] outline-none disabled:bg-gray-100" 
              placeholder="email@karyawan.com"
              disabled={isEditMode} // Email biasanya tidak boleh diganti sembarangan
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 3. Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] outline-none bg-white"
              >
                <option value="OUTLET_ADMIN">Outlet Admin</option>
                <option value="WORKER">Worker</option>
                <option value="DRIVER">Driver</option>
              </select>
            </div>

            {/* 4. Outlet Assignment */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Penempatan <span className="text-red-500">*</span></label>
              <select 
                value={formData.outletId}
                onChange={(e) => setFormData({...formData, outletId: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] outline-none bg-white"
              >
                <option value="">Pilih Outlet</option>
                <option value="101">Chingu Binjai</option>
                <option value="102">Chingu Medan</option>
              </select>
            </div>
          </div>

          {/* 5. Station (Khusus Worker) */}
          {isWorker && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Station Tugas <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {['WASHING', 'IRONING', 'PACKING'].map((station) => (
                  <button
                    key={station}
                    type="button"
                    onClick={() => setFormData({...formData, station: station as any})}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      formData.station === station 
                      ? 'bg-purple-50 border-purple-500 text-purple-700' 
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {station}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Worker hanya bisa memegang 1 station.</p>
            </div>
          )}

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
              {isEditMode ? 'Simpan Perubahan' : 'Tambah Karyawan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}