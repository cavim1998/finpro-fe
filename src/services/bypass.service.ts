import { axiosInstance } from "@/lib/axios";

export interface BypassRequest {
  id: number;
  reason: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED";
  requestedAt: string;
  createdAt?: string;
  decidedAt?: string | null;
  adminNote?: string | null;
  requestedBy: {
    profile: { fullName: string };
    email: string;
  };
  approvedBy?: {
    profile?: { fullName?: string | null };
    email?: string;
  } | null;
  orderStation: {
    stationType: string;
    order: {
      orderNo: string;
      outlet: { name: string };
    };
  };
  diffs: {
    id: number;
    prevQty: number;
    currentQty: number;
    item: { name: string; unit: string };
  }[];
}

interface GetBypassParams {
  page?: number;
  limit?: number;
  outletId?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getBypassRequests = async (params: GetBypassParams) => {
  const response = await axiosInstance.get("/bypass-requests", { params });
  return response.data;
};

export const decisionBypass = async (
  id: number,
  action: "APPROVE" | "REJECT",
  adminNote?: string,
) => {
  const response = await axiosInstance.patch(
    `/bypass-requests/${id}/decision`,
    {
      action,
      adminNote,
    },
  );
  return response.data;
};
