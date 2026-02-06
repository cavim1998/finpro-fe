import { useState } from "react";
import { toast } from "sonner";
import { useOutlets, useDeleteOutlet } from "@/hooks/api/useOutlet";
import { useLaundryItems, useDeleteItem } from "@/hooks/api/useLaundryItem";
import { useEmployees, useUnassignEmployee } from "@/hooks/api/useEmployee";
import { useShiftTemplates, useDeleteShift } from "@/hooks/api/useShift";

export type SubTab = "USERS" | "OUTLETS" | "ITEMS" | "SHIFTS";

export const useMasterData = () => {
  const [subTab, setSubTab] = useState<SubTab>("USERS");
  const [modals, setModals] = useState({
    outlet: false,
    item: false,
    employee: false,
    shift: false,
  });
  const [selectedData, setSelectedData] = useState<{
    user: any;
    outlet: any;
    item: any;
  }>({ user: null, outlet: null, item: null });
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number | string;
    name: string;
    type: SubTab;
  } | null>(null);

  const employeesQuery = useEmployees();
  const unassignEmployeeMutation = useUnassignEmployee();
  const outletsQuery = useOutlets();
  const deleteOutletMutation = useDeleteOutlet();
  const itemsQuery = useLaundryItems();
  const deleteItemMutation = useDeleteItem();

  const shiftsQuery = useShiftTemplates(outletsQuery.data?.[0]?.id);
  const deleteShiftMutation = useDeleteShift();

  const openModal = (type: keyof typeof modals, data: any = null) => {
    if (type === "outlet") setSelectedData((p) => ({ ...p, outlet: data }));
    if (type === "item") setSelectedData((p) => ({ ...p, item: data }));
    if (type === "employee") setSelectedData((p) => ({ ...p, user: data }));
    setModals((p) => ({ ...p, [type]: true }));
  };

  const closeModal = (type: keyof typeof modals) =>
    setModals((p) => ({ ...p, [type]: false }));

  const handleDeleteTrigger = (
    id: number | string,
    name: string,
    type: SubTab,
  ) => setDeleteTarget({ id, name, type });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const onSuccess = () => {
      toast.success("Data berhasil dihapus");
      setDeleteTarget(null);
    };
    const onError = () => toast.error("Gagal menghapus data");

    if (deleteTarget.type === "OUTLETS")
      deleteOutletMutation.mutate(deleteTarget.id as number, {
        onSuccess,
        onError,
      });
    else if (deleteTarget.type === "ITEMS")
      deleteItemMutation.mutate(deleteTarget.id as number, {
        onSuccess,
        onError,
      });
    else if (deleteTarget.type === "USERS")
      unassignEmployeeMutation.mutate(deleteTarget.id as string, {
        onSuccess,
        onError,
      });
    else if (deleteTarget.type === "SHIFTS")
      deleteShiftMutation.mutate(deleteTarget.id as number, {
        onSuccess,
        onError,
      });
  };

  return {
    state: {
      subTab,
      modals,
      selectedData,
      deleteTarget,
      employees: employeesQuery.data || [],
      isLoadingEmployees: employeesQuery.isLoading,
      isErrorEmployees: employeesQuery.isError,
      outlets: outletsQuery.data || [],
      isLoadingOutlets: outletsQuery.isLoading,
      isErrorOutlets: outletsQuery.isError,
      items: itemsQuery.data || [],
      isLoadingItems: itemsQuery.isLoading,
      isErrorItems: itemsQuery.isError,
      shifts: shiftsQuery.data || [],
      isLoadingShifts: shiftsQuery.isLoading,
      isErrorShifts: shiftsQuery.isError,
    },
    actions: {
      setSubTab,
      openModal,
      closeModal,
      handleDeleteTrigger,
      setDeleteTarget,
      confirmDelete,
    },
  };
};
