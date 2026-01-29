'use client';

import { Shirt, Trash2, Plus } from 'lucide-react';

interface ItemsGridProps {
  onCreate: () => void;
  onDelete: (id: number, name: string) => void;
}

export const ItemsGrid = ({ onCreate, onDelete }: ItemsGridProps) => {
  const items = [
    { id: 1, name: 'Kaos', unit: 'Pcs' }, 
    { id: 2, name: 'Bed Cover', unit: 'Pcs' }
  ];

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h3 className="font-bold text-lg">Laundry Items</h3>
        <button 
          onClick={onCreate}
          className="bg-[#17A2B8] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-[#138496]"
        >
          <Plus size={16}/> Add Item
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow relative group">
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(item.id, item.name); }}
              className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
            >
              <Trash2 size={14} />
            </button>
            <div className="bg-orange-50 p-3 rounded-full text-orange-500 mb-3"><Shirt size={24}/></div>
            <h4 className="font-bold text-gray-800">{item.name}</h4>
            <p className="text-xs text-gray-400 mt-1 uppercase bg-gray-100 px-2 py-0.5 rounded">{item.unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
};