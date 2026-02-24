"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
import MasterShiftView from "./MasterDataSection/MasterShiftView";

export default function MasterDataSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { state, actions } = useMasterData();

  const viewParam = searchParams.get("view")?.toUpperCase();
  const validTabs = ["ITEMS", "OUTLETS", "SHIFTS", "USERS"];
  const currentView = validTabs.includes(viewParam || "") ? viewParam : "USERS";

  useEffect(() => {
    if (!viewParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", "USERS");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [viewParam, searchParams, pathname, router]);

  useEffect(() => {
    if (currentView && state.subTab !== currentView) {
      actions.setSubTab(currentView as any);
    }
  }, [currentView, state.subTab, actions]);

  // 4. Handler Ganti Tab: Update URL
  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams();
    params.set("tab", "MASTER");
    params.set("view", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <MasterDataNav
        activeTab={currentView as any}
        onTabChange={handleTabChange}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-100">
        {state.subTab === "USERS" &&
          (state.isLoadingEmployees ? (
            <LoadingState text="Memuat pegawai..." />
          ) : state.isErrorEmployees ? (
            <ErrorState text="Gagal memuat pegawai." />
          ) : (
            <MasterEmployeeView actions={actions} />
          ))}

        {state.subTab === "OUTLETS" &&
          (state.isLoadingOutlets ? (
            <LoadingState text="Memuat outlet..." />
          ) : state.isErrorOutlets ? (
            <ErrorState text="Gagal memuat outlet." />
          ) : (
            <MasterOutletView actions={actions} />
          ))}

        {state.subTab === "ITEMS" &&
          (state.isLoadingItems ? (
            <LoadingState text="Memuat items..." />
          ) : state.isErrorItems ? (
            <ErrorState text="Gagal memuat items." />
          ) : (
            <MasterItemView actions={actions} />
          ))}

        {state.subTab === "SHIFTS" &&
          (state.isLoadingShifts ? (
            <LoadingState text="Memuat shifts..." />
          ) : state.isErrorShifts ? (
            <ErrorState text="Gagal memuat shifts." />
          ) : (
            <MasterShiftView actions={actions} />
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
