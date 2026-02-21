import { axiosInstance } from "@/lib/axios";

export const getSalesReport = async (params: {
  outletId?: number;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await axiosInstance.get("/reports/sales", { params });
  return response.data;
};

export const getPerformanceReport = async (params: {
  outletId?: number;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await axiosInstance.get("/reports/performance", { params });
  return response.data;
};
