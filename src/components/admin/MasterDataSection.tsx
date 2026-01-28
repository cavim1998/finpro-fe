'use client';

import React, { useState } from 'react';
import { Users, Store, Shirt, Plus, Edit, Trash2, MapPin } from 'lucide-react';

type SubTab = 'USERS' | 'OUTLETS' | 'ITEMS';

export default function MasterDataSection() {
  const [subTab, setSubTab] = useState<SubTab>('USERS');

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      
      {/* Navigation Tabs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">Master Data Management</h2>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <TabButton active={subTab === 'USERS'} onClick={() => setSubTab('USERS')} icon={<Users size={16}/>} label="Employees" />
          <TabButton active={subTab === 'OUTLETS'} onClick={() => setSubTab('OUTLETS')} icon={<Store size={16}/>} label="Outlets" />
          <TabButton active={subTab === 'ITEMS'} onClick={() => setSubTab('ITEMS')} icon={<Shirt size={16}/>} label="Items" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-100">
        {subTab === 'USERS' && <UsersTable />}
        {subTab === 'OUTLETS' && <OutletsGrid />}
        {subTab === 'ITEMS' && <ItemsGrid />}
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

const UsersTable = () => {
  const users = [
    { id: 1, name: 'Budi Santoso', role: 'Outlet Admin', outlet: 'Cabang Tangerang' },
    { id: 2, name: 'Siti Aminah', role: 'Washing Worker', outlet: 'Cabang Jakarta' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h3 className="font-bold text-lg">Employee List</h3>
        <ActionButton label="Add Employee" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 uppercase text-gray-500 font-semibold">
            <tr><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Outlet</th><th className="p-3 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3"><span className="bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">{u.role}</span></td>
                <td className="p-3 text-gray-500">{u.outlet}</td>
                <td className="p-3 text-right flex justify-end gap-2">
                  <button className="text-blue-500 p-1 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                  <button className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const OutletsGrid = () => {
  const outlets = [{ id: 101, name: 'Chingu Binjai', address: 'Jl. Soekarno Hatta No. 10', staff: 5 }];

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h3 className="font-bold text-lg">Outlet List</h3>
        <ActionButton label="Create Outlet" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {outlets.map(o => (
          <div key={o.id} className="border border-gray-200 rounded-xl p-4 hover:border-[#17A2B8] transition-colors group">
            <div className="flex justify-between mb-2">
              <div className="bg-blue-50 p-2 rounded-lg text-[#17A2B8]"><Store size={24} /></div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="p-1 hover:bg-gray-100 rounded"><Edit size={16} className="text-gray-500"/></button>
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

const ItemsGrid = () => {
  const items = [{ id: 1, name: 'Kaos', unit: 'Pcs' }, { id: 2, name: 'Bed Cover', unit: 'Pcs' }];

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h3 className="font-bold text-lg">Laundry Items</h3>
        <ActionButton label="Add Item" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-orange-50 p-3 rounded-full text-orange-500 mb-3"><Shirt size={24}/></div>
            <h4 className="font-bold text-gray-800">{item.name}</h4>
            <p className="text-xs text-gray-400 mt-1">{item.unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${active ? 'bg-white text-[#17A2B8] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
    {icon} {label}
  </button>
);

const ActionButton = ({ label }: { label: string }) => (
  <button className="bg-[#17A2B8] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-[#138496]">
    <Plus size={16}/> {label}
  </button>
);