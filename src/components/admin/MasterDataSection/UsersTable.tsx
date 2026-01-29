'use client';

import { Edit, Trash2, Plus } from 'lucide-react';

interface UsersTableProps {
  onAdd: () => void;
  onEdit: (user: any) => void;
  onDelete: (id: number, name: string) => void;
}

export const UsersTable = ({ onAdd, onEdit, onDelete }: UsersTableProps) => {
  // Dummy Data
  const users = [
    { id: 1, name: 'Budi Santoso', role: 'Outlet Admin', outlet: 'Cabang Binjai' },
    { id: 2, name: 'Siti Aminah', role: 'Washing Worker', outlet: 'Cabang Medan' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h3 className="font-bold text-lg">Employee List</h3>
        <button 
          onClick={onAdd}
          className="bg-[#17A2B8] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-[#138496]"
        >
          <Plus size={16}/> Add Employee
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 uppercase text-gray-500 font-semibold">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Outlet</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">
                    {u.role}
                  </span>
                </td>
                <td className="p-3 text-gray-500">{u.outlet}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => onEdit(u)} className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                    <Edit size={16}/>
                  </button>
                  <button onClick={() => onDelete(u.id, u.name)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                    <Trash2 size={16}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};