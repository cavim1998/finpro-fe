import { axiosInstance } from "@/lib/axios";

export const getDashboardStats = async (outletId?: number) => {
  const response = await axiosInstance.get("/dashboard/stats", {
    params: { outletId },
  });
  return response.data;
};
