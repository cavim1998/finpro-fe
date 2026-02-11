import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { useOutlets } from "@/hooks/api/useOutlet";
import { useAvailableUsers, useAssignEmployee } from "@/hooks/api/useEmployee";
import { useShiftTemplates } from "@/hooks/api/useShift";

const assignSchema = z.object({
  userId: z.string().min(1, "Wajib memilih pegawai"),
  outletId: z.coerce.number().min(1, "Wajib memilih outlet"),
  role: z.enum(["SUPER_ADMIN", "OUTLET_ADMIN", "WORKER", "DRIVER", "CUSTOMER"]),
  shiftTemplateId: z.coerce.number().min(1, "Wajib memilih shift"),
});

type AssignFormData = z.infer<typeof assignSchema>;

interface UseAssignEmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export const useAssignEmployeeForm = ({
  isOpen,
  onClose,
  initialData,
}: UseAssignEmployeeFormProps) => {
  const isEditMode = !!initialData;

  const assignMutation = useAssignEmployee();
  const { data: outlets = [] } = useOutlets();
  const { data: availableUsers = [] } = useAvailableUsers();

  const form = useForm({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      userId: "",
      outletId: 0,
      role: "WORKER",
      shiftTemplateId: 0,
    },
  });

  const selectedOutletId = form.watch("outletId");
  const outletIdParam = selectedOutletId ? Number(selectedOutletId) : undefined;

  const { data: shifts = [], isLoading: isLoadingShifts } =
    useShiftTemplates(outletIdParam);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          userId: initialData.id,
          outletId: initialData.outletId,
          role: initialData.role,
          shiftTemplateId: initialData.shiftTemplateId || 0,
        });
      } else {
        form.reset({
          userId: "",
          outletId: 0,
          role: "WORKER",
          shiftTemplateId: 0,
        });
      }
    }
  }, [isOpen, initialData, form]);

  useEffect(() => {
    if (isOpen && initialData && shifts.length > 0) {
      const targetShiftId = initialData.shiftTemplateId;
      const isShiftExists = shifts.some((s: any) => s.id === targetShiftId);

      if (isShiftExists) {
        form.setValue("shiftTemplateId", targetShiftId);
      }
    }
  }, [shifts, isOpen, initialData, form]);

  const onSubmit = (data: AssignFormData) => {
    const payload = {
      ...data,
      userId: Number(data.userId),
      shiftTemplateId: data.shiftTemplateId.toString(),
    };

    assignMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(
          isEditMode
            ? "Penugasan berhasil diperbarui"
            : "Pegawai berhasil di-assign",
        );
        onClose();
      },
      onError: (err: any) =>
        toast.error(err?.response?.data?.error || "Gagal menyimpan data"),
    });
  };

  const userOptions = useMemo(() => {
    return isEditMode ? [initialData] : availableUsers;
  }, [isEditMode, initialData, availableUsers]);

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isEditMode,
    isPending: assignMutation.isPending,
    data: {
      outlets,
      shifts,
      userOptions,
    },
    uiState: {
      isLoadingShifts,
      hasOutletButNoShift:
        !isLoadingShifts && outletIdParam && shifts.length === 0,
    },
  };
};
