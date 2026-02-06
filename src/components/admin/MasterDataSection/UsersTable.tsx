"use client";

import {
  Edit,
  Trash2,
  Plus,
  UserCircle,
  MapPin,
  Clock,
  Shield,
} from "lucide-react";
import { Employee } from "@/types/employee";

interface UsersTableProps {
  data: Employee[];
  onAdd: () => void;
  onEdit: (user: Employee) => void;
  onDelete: (id: string, name: string) => void;
}

export const UsersTable = ({
  data,
  onAdd,
  onEdit,
  onDelete,
}: UsersTableProps) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-red-100 text-red-700 border-red-200";
      case "OUTLET_ADMIN":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "DRIVER":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h3 className="font-bold text-lg">Daftar Pegawai</h3>
        <button
          onClick={onAdd}
          className="bg-[#17A2B8] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-[#138496] shadow-sm transition-all"
        >
          <Plus size={16} /> Assign Pegawai
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-4">Pegawai</th>
              <th className="p-4">Role</th>
              <th className="p-4">Penempatan & Jadwal</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  Belum ada pegawai yang ditugaskan.
                </td>
              </tr>
            ) : (
              data.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full text-gray-400">
                        <UserCircle size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {u.user.profile.fullName}
                        </p>
                        <p className="text-xs text-gray-500">{u.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-1 w-fit ${getRoleBadge(u.role)}`}
                    >
                      <Shield size={10} /> {u.user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5">
                      {/* Outlet Info */}
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <MapPin size={14} className="text-[#17A2B8]" />
                        {u.outlet?.name || (
                          <span className="text-red-400 italic font-normal text-xs">
                            Belum ditempatkan
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(u)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="Edit Penugasan"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() =>
                          onDelete(u.user.id, u.user.profile.fullName)
                        }
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                        title="Hapus Penugasan (Unassign)"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
