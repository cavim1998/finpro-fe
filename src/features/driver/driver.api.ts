import { axiosInstance } from "@/lib/axios";

export type DriverDashboardQuery = {
  pageSize?: number;
  taskPage?: number;
  pickupPage?: number;
};

export async function getDriverDashboardApi(q?: DriverDashboardQuery) {
  const res = await axiosInstance.get("/driver/dashboard", { params: q });
  return res.data;
}
