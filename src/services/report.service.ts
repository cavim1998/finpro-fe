import { axiosInstance } from "@/lib/axios";

function buildReportParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
  );
}

export const getSalesReport = async (params: {
  outletId?: number;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await axiosInstance.get("/reports/sales", {
    params: buildReportParams(params),
  });
  return response.data;
};

export const getPerformanceReport = async (params: {
  outletId?: number;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await axiosInstance.get("/reports/performance", {
    params: buildReportParams(params),
  });
  return response.data;
};

export const getAttendanceReport = async (params: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await axiosInstance.get("/reports/attendance", {
    params: buildReportParams(params),
  });
  return response.data;
};

export const getAdminAttendanceReport = async (params: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await axiosInstance.get("/attendance/admin/history", {
    params: buildReportParams(params),
  });
  return response.data;
};

export const getAttendanceHistoryDetailReport = async (
  outletStaffId: number,
  params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  },
) => {
  const response = await axiosInstance.get(
    `/reports/attendance/${outletStaffId}/history`,
    {
      params: buildReportParams(params),
    },
  );
  return response.data;
};
