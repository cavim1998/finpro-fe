'use client';

import { Edit, Trash2, Store, MapPin, Plus } from 'lucide-react';

interface OutletsGridProps {
  onCreate: () => void;
  onDelete: (id: number, name: string) => void;
}

export const OutletsGrid = ({ onCreate, onDelete }: OutletsGridProps) => {
  const outlets = [
    { id: 101, name: 'Chingu Binjai', address: 'Jl. Soekarno Hatta No. 10', staff: 5 }
  ];

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h3 className="font-bold text-lg">Outlet List</h3>
        <button 
          onClick={onCreate}
          className="bg-[#17A2B8] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-[#138496]"
        >
          <Plus size={16}/> Create Outlet
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {outlets.map(o => (
          <div key={o.id} className="border border-gray-200 rounded-xl p-4 hover:border-[#17A2B8] transition-colors group">
            <div className="flex justify-between items-start mb-2">
              <div className="bg-blue-50 p-2 rounded-lg text-[#17A2B8]"><Store size={24} /></div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="p-1 hover:bg-gray-100 rounded"><Edit size={16} className="text-gray-500"/></button>
                 <button onClick={() => onDelete(o.id, o.name)} className="p-1 hover:bg-gray-100 rounded"><Trash2 size={16} className="text-red-500"/></button>
              </div>
            </div>
            <h4 className="font-bold text-gray-800">{o.name}</h4>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={14}/> {o.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
};