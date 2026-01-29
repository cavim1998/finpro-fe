'use client';

import { useState } from 'react';
import { Users, Store, Shirt } from 'lucide-react';
import { UsersTable } from './MasterDataSection/UsersTable';
import { OutletsGrid } from './MasterDataSection/OutletsGrid';
import { ItemsGrid } from './MasterDataSection/ItemsGrid';
import CreateOutletModal from '@/components/admin/modal/CreateOutletModal';
import CreateItemModal from '@/components/admin/modal/CreateItemModal';
import CreateEmployeeModal from '@/components/admin/modal/CreateEmployeeModal';
import DeleteConfirmationModal from '@/components/admin/modal/DeleteConfirmationModal';

type SubTab = 'USERS' | 'OUTLETS' | 'ITEMS';

export default function MasterDataSection() {
  const [subTab, setSubTab] = useState<SubTab>('USERS');
  const [showOutletModal, setShowOutletModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number, name: string, type: SubTab } | null>(null);

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEmployeeModal(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowEmployeeModal(true);
  };

  const handleDelete = (id: number, name: string, type: SubTab) => {
    setDeleteTarget({ id, name, type });
  };

  const confirmDelete = () => {
    console.log('Deleted:', deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      
      {/* Navigation Tabs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">Master Data Management</h2>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setSubTab('USERS')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${subTab === 'USERS' ? 'bg-white text-[#17A2B8] shadow-sm' : 'text-gray-500'}`}>
            <Users size={16}/> Employees
          </button>
          <button onClick={() => setSubTab('OUTLETS')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${subTab === 'OUTLETS' ? 'bg-white text-[#17A2B8] shadow-sm' : 'text-gray-500'}`}>
            <Store size={16}/> Outlets
          </button>
          <button onClick={() => setSubTab('ITEMS')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${subTab === 'ITEMS' ? 'bg-white text-[#17A2B8] shadow-sm' : 'text-gray-500'}`}>
            <Shirt size={16}/> Items
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
        {subTab === 'USERS' && (
          <UsersTable 
            onAdd={handleAddUser} 
            onEdit={handleEditUser} 
            onDelete={(id, name) => handleDelete(id, name, 'USERS')} 
          />
        )}
        
        {subTab === 'OUTLETS' && (
          <OutletsGrid 
            onCreate={() => setShowOutletModal(true)} 
            onDelete={(id, name) => handleDelete(id, name, 'OUTLETS')} 
          />
        )}
        
        {subTab === 'ITEMS' && (
          <ItemsGrid 
            onCreate={() => setShowItemModal(true)} 
            onDelete={(id, name) => handleDelete(id, name, 'ITEMS')} 
          />
        )}
      </div>

      {/* Modals Injection */}
      <CreateEmployeeModal isOpen={showEmployeeModal} onClose={() => setShowEmployeeModal(false)} initialData={selectedUser} />
      <CreateOutletModal isOpen={showOutletModal} onClose={() => setShowOutletModal(false)} />
      <CreateItemModal isOpen={showItemModal} onClose={() => setShowItemModal(false)} />
      
      <DeleteConfirmationModal 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={confirmDelete} 
        itemName={deleteTarget?.name}
      />
    </div>
  );
}