import { z } from "zod";

export const outletSchema = z.object({
  name: z.string().min(1, "Nama outlet wajib diisi"),
  addressText: z.string().min(5, "Alamat minimal 5 karakter"),
  latitude: z.number({
    message: "Wajib pilih lokasi di peta",
  }),
  longitude: z.number({
    message: "Wajib pilih lokasi di peta",
  }),
});

export type OutletFormData = z.infer<typeof outletSchema>;
