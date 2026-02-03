"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UsersTable } from "./MasterDataSection/UsersTable";
import { OutletsGrid } from "./MasterDataSection/OutletsGrid";
import { ItemsGrid } from "./MasterDataSection/ItemsGrid";
import { MasterDataNav, SubTab } from "./MasterDataSection/MasterDataNav";
import CreateOutletModal from "@/components/admin/modal/CreateOutletModal";
import CreateItemModal from "@/components/admin/modal/CreateItemModal";
import CreateEmployeeModal from "@/components/admin/modal/CreateEmployeeModal";
import DeleteConfirmationModal from "@/components/admin/modal/DeleteConfirmationModal";
import { useOutlets, useDeleteOutlet } from "@/hooks/api/useOutlet";
import { useLaundryItems, useDeleteItem } from "@/hooks/api/useLaundryItem";
import { ErrorState } from "../ErrorState";
import { LoadingState } from "../LoadingState";

export default function MasterDataSection() {
  const [subTab, setSubTab] = useState<SubTab>("USERS");
  const [showOutletModal, setShowOutletModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedOutlet, setSelectedOutlet] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
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
  const {
    data: items = [],
    isLoading: isLoadingItems,
    isError: isErrorItems,
  } = useLaundryItems();
  const deleteItemMutation = useDeleteItem();

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEmployeeModal(true);
  };
  const handleAddUser = () => {
    setSelectedUser(null);
    setShowEmployeeModal(true);
  };
  const handleEditOutlet = (outlet: any) => {
    setSelectedOutlet(outlet);
    setShowOutletModal(true);
  };
  const handleCreateOutlet = () => {
    setSelectedOutlet(null);
    setShowOutletModal(true);
  };
  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };
  const handleCreateItem = () => {
    setSelectedItem(null);
    setShowItemModal(true);
  };
  const handleDeleteTrigger = (id: number, name: string, type: SubTab) => {
    setDeleteTarget({ id, name, type });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    const onSuccess = () => {
      toast.success(
        `${deleteTarget.type === "OUTLETS" ? "Outlet" : "Item"} ${deleteTarget.name} berhasil dihapus`,
      );
      setDeleteTarget(null);
    };
    const onError = () => toast.error("Gagal menghapus data");

    if (deleteTarget.type === "OUTLETS") {
      deleteOutletMutation.mutate(deleteTarget.id, { onSuccess, onError });
    } else if (deleteTarget.type === "ITEMS") {
      deleteItemMutation.mutate(deleteTarget.id, { onSuccess, onError });
    } else {
      toast.info("Fitur hapus user belum tersedia");
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <MasterDataNav activeTab={subTab} onTabChange={setSubTab} />

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
            <LoadingState text="Memuat data outlet..." />
          ) : isErrorOutlets ? (
            <ErrorState text="Gagal memuat outlet." />
          ) : (
            <OutletsGrid
              data={outlets}
              onCreate={handleCreateOutlet}
              onEdit={handleEditOutlet}
              onDelete={(id) => {
                const name =
                  outlets.find((o: any) => o.id === id)?.name || "Outlet";
                handleDeleteTrigger(id, name, "OUTLETS");
              }}
            />
          ))}

        {subTab === "ITEMS" &&
          (isLoadingItems ? (
            <LoadingState text="Memuat item laundry..." />
          ) : isErrorItems ? (
            <ErrorState text="Gagal memuat item laundry." />
          ) : (
            <ItemsGrid
              data={items}
              onCreate={handleCreateItem}
              onEdit={handleEditItem}
              onDelete={(id) => {
                const name =
                  items.find((i: any) => i.id === id)?.name || "Item";
                handleDeleteTrigger(id, name, "ITEMS");
              }}
            />
          ))}
      </div>

      <CreateEmployeeModal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        initialData={selectedUser}
      />

      <CreateOutletModal
        isOpen={showOutletModal}
        onClose={() => setShowOutletModal(false)}
        initialData={selectedOutlet}
      />

      <CreateItemModal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        initialData={selectedItem}
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
