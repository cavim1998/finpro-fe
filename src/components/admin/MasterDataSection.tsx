"use client";

import { useState } from "react";
import { Users, Store, Shirt, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UsersTable } from "./MasterDataSection/UsersTable";
import { OutletsGrid } from "./MasterDataSection/OutletsGrid";
import { ItemsGrid } from "./MasterDataSection/ItemsGrid";
import CreateOutletModal from "@/components/admin/modal/CreateOutletModal";
import CreateItemModal from "@/components/admin/modal/CreateItemModal";
import CreateEmployeeModal from "@/components/admin/modal/CreateEmployeeModal";
import DeleteConfirmationModal from "@/components/admin/modal/DeleteConfirmationModal";
import { useOutlets, useDeleteOutlet } from "@/hooks/useOutlet";

type SubTab = "USERS" | "OUTLETS" | "ITEMS";

export default function MasterDataSection() {
  const [subTab, setSubTab] = useState<SubTab>("USERS");
  const [showOutletModal, setShowOutletModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedOutlet, setSelectedOutlet] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
    type: SubTab;
  } | null>(null);

  const {
    data: outlets = [],
    isLoading: isLoadingOutlets,
    isError: isErrorOutlets,
  } = useOutlets();

  const deleteOutletMutation = useDeleteOutlet();
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEmployeeModal(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowEmployeeModal(true);
  };

  // Outlet Handlers
  const handleEditOutlet = (outlet: any) => {
    setSelectedOutlet(outlet);
    setShowOutletModal(true);
  };

  const handleCreateOutlet = () => {
    setSelectedOutlet(null);
    setShowOutletModal(true);
  };

  // Generic Delete Setup
  const handleDeleteTrigger = (id: number, name: string, type: SubTab) => {
    setDeleteTarget({ id, name, type });
  };

  // Confirm Delete Action
  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "OUTLETS") {
      deleteOutletMutation.mutate(deleteTarget.id, {
        onSuccess: () => {
          toast.success(`Outlet ${deleteTarget.name} berhasil dihapus`);
          setDeleteTarget(null);
        },
        onError: (err: any) => {
          console.error(err);
          toast.error("Gagal menghapus outlet");
        },
      });
    } else {
      console.log("Deleted Mock:", deleteTarget);
      toast.info(`Simulasi hapus ${deleteTarget.type}: ${deleteTarget.name}`);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      {/* Navigation Tabs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">
          Master Data Management
        </h2>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setSubTab("USERS")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${subTab === "USERS" ? "bg-white text-[#17A2B8] shadow-sm" : "text-gray-500"}`}
          >
            <Users size={16} /> Employees
          </button>
          <button
            onClick={() => setSubTab("OUTLETS")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${subTab === "OUTLETS" ? "bg-white text-[#17A2B8] shadow-sm" : "text-gray-500"}`}
          >
            <Store size={16} /> Outlets
          </button>
          <button
            onClick={() => setSubTab("ITEMS")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${subTab === "ITEMS" ? "bg-white text-[#17A2B8] shadow-sm" : "text-gray-500"}`}
          >
            <Shirt size={16} /> Items
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-100">
        {subTab === "USERS" && (
          <UsersTable
            onAdd={handleAddUser}
            onEdit={handleEditUser}
            onDelete={(id, name) => handleDeleteTrigger(id, name, "USERS")}
          />
        )}

        {subTab === "OUTLETS" &&
          (isLoadingOutlets ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p>Memuat data outlet...</p>
            </div>
          ) : isErrorOutlets ? (
            <div className="text-center py-10 text-red-500">
              Gagal mengambil data outlet. Pastikan backend berjalan.
            </div>
          ) : (
            <OutletsGrid
              data={outlets}
              onCreate={handleCreateOutlet}
              onEdit={handleEditOutlet}
              onDelete={(id) => {
                const outletName =
                  outlets.find((o: any) => o.id === id)?.name || "Outlet";
                handleDeleteTrigger(id, outletName, "OUTLETS");
              }}
            />
          ))}

        {/* TAB ITEMS */}
        {subTab === "ITEMS" && (
          <ItemsGrid
            onCreate={() => setShowItemModal(true)}
            onDelete={(id, name) => handleDeleteTrigger(id, name, "ITEMS")}
          />
        )}
      </div>

      {/* Modals Injection */}
      <CreateEmployeeModal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        initialData={selectedUser}
      />

      {/* Modal Outlet dengan Hooks yang baru */}
      <CreateOutletModal
        isOpen={showOutletModal}
        onClose={() => setShowOutletModal(false)}
        initialData={selectedOutlet}
      />

      <CreateItemModal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        itemName={deleteTarget?.name}
      />
    </div>
  );
}
