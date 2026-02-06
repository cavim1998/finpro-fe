import { z } from "zod";

export const RoleEnum = z.enum([
  "SUPER_ADMIN",
  "OUTLET_ADMIN",
  "WORKER",
  "DRIVER",
  "CUSTOMER",
]);

export const assignmentSchema = z.object({
  userId: z.string().min(1, "Wajib memilih pegawai"),
  outletId: z.coerce.number().min(1, "Wajib memilih outlet"),
  shift: z.string().min(1, "Jadwal shift wajib diisi"),
  role: RoleEnum,
});

export type AssignmentFormData = z.infer<typeof assignmentSchema>;
