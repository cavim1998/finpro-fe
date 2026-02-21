import { axiosInstance } from "@/lib/axios";

export interface OrderItemInput {
  itemId: number;
  qty: number;
}

export interface CreateOrderPayload {
  pickupRequestId: string;
  serviceType: "REGULAR" | "PREMIUM";
  totalWeightKg: number;
  deliveryFee: number;
  items: OrderItemInput[];
}

export interface GetParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  outletId?: number;
}

export const createOrder = async (payload: CreateOrderPayload) => {
  const response = await axiosInstance.post("/orders", payload);
  return response.data;
};

export const getLaundryItems = async () => {
  const response = await axiosInstance.get("/laundry-items");
  return response.data;
};

export const getOrders = async (params: GetParams) => {
  const response = await axiosInstance.get("/orders", { params });
  return response.data;
};

export const getPickups = async (params: GetParams) => {
  const response = await axiosInstance.get("/admin-pickup", { params });
  return response.data;
};

export const getAdminOrderById = async (id: string) => {
  const response = await axiosInstance.get(`/orders/admin/${id}`);
  return response.data;
};
