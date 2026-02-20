"use client";

import { ShiftsGrid } from "./MasterDataSection/ShiftsGrid";
import { MasterDataNav } from "./MasterDataSection/MasterDataNav";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import CreateOutletModal from "@/components/admin/modal/CreateOutletModal";
import CreateItemModal from "@/components/admin/modal/CreateItemModal";
import AssignEmployeeModal from "@/components/admin/modal/AssignEmployeeModal";
import CreateShiftModal from "@/components/admin/modal/CreateShiftModal";
import DeleteConfirmationModal from "@/components/admin/modal/DeleteConfirmationModal";
import { useMasterData } from "./MasterDataSection/useMasterData";
import MasterOutletView from "./MasterDataSection/MasterOutletView";
import MasterItemView from "./MasterDataSection/MasterItemView";
import MasterEmployeeView from "./MasterDataSection/MasterUserView";

export default function MasterDataSection() {
  const { state, actions } = useMasterData();

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <MasterDataNav activeTab={state.subTab} onTabChange={actions.setSubTab} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-100">
        {state.subTab === "USERS" &&
          (state.isLoadingEmployees ? (
            <LoadingState text="Memuat pegawai..." />
          ) : state.isErrorEmployees ? (
            <ErrorState text="Gagal memuat pegawai." />
          ) : (
            <MasterEmployeeView />
          ))}

        {state.subTab === "OUTLETS" &&
          (state.isLoadingOutlets ? (
            <LoadingState text="Memuat outlet..." />
          ) : state.isErrorOutlets ? (
            <ErrorState text="Gagal memuat outlet." />
          ) : (
            <MasterOutletView />
          ))}

        {state.subTab === "ITEMS" &&
          (state.isLoadingItems ? (
            <LoadingState text="Memuat items..." />
          ) : state.isErrorItems ? (
            <ErrorState text="Gagal memuat items." />
          ) : (
            <MasterItemView />
          ))}

        {state.subTab === "SHIFTS" &&
          (state.isLoadingShifts ? (
            <LoadingState text="Memuat shifts..." />
          ) : state.isErrorShifts ? (
            <ErrorState text="Gagal memuat shifts." />
          ) : (
            <ShiftsGrid
              data={state.shifts}
              onCreate={() => actions.openModal("shift")}
              onDelete={(id) =>
                actions.handleDeleteTrigger(id, "Shift", "SHIFTS")
              }
            />
          ))}
      </div>

      <AssignEmployeeModal
        isOpen={state.modals.employee}
        onClose={() => actions.closeModal("employee")}
        initialData={state.selectedData.user}
      />
      <CreateOutletModal
        isOpen={state.modals.outlet}
        onClose={() => actions.closeModal("outlet")}
        initialData={state.selectedData.outlet}
      />
      <CreateItemModal
        isOpen={state.modals.item}
        onClose={() => actions.closeModal("item")}
        initialData={state.selectedData.item}
      />
      <CreateShiftModal
        isOpen={state.modals.shift}
        onClose={() => actions.closeModal("shift")}
      />

      <DeleteConfirmationModal
        isOpen={!!state.deleteTarget}
        onClose={() => actions.setDeleteTarget(null)}
        onConfirm={actions.confirmDelete}
        itemName={state.deleteTarget?.name}
      />
    </div>
  );
}
