import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export type AttendanceHistoryQuery = {
  page: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
};

export type AttendanceHistoryItem = {
  id: number;
  date: string;
  clockInAt: string | null;
  clockOutAt: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AttendanceHistoryResponse = {
  outletStaffId: number;
  outletId: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filter: {
    startDate: string;
    endDate: string;
  };
  items: AttendanceHistoryItem[];
};

export function useAttendanceHistoryQuery(
  params: AttendanceHistoryQuery,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["attendance", "history", params],
    queryFn: async () => {
      const res = await axiosInstance.get("/attendance/me/history", { params });
      return (res.data?.data ?? res.data) as AttendanceHistoryResponse;
    },
    enabled: options?.enabled ?? true,
  });
}

