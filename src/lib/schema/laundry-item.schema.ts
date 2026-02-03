import { z } from "zod";

export const laundryItemSchema = z.object({
  name: z.string().min(1, "Nama item wajib diisi"),
  price: z.coerce.number().min(0, "Harga tidak boleh minus"),
  unit: z.string().default("PCS"),
});

export type LaundryItemFormData = z.infer<typeof laundryItemSchema>;
