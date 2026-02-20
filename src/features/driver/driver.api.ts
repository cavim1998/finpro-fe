// import { axiosInstance } from "@/lib/axios";

// export type DriverDashboardQuery = {
//   pageSize?: number;
//   taskPage?: number;
//   pickupPage?: number;
// };

// export async function getDriverDashboardApi(q?: DriverDashboardQuery) {
//   const res = await axiosInstance.get("/driver/dashboard", { params: q });
//   return res.data;
// };

// import { api } from "@/lib/api";

// export type DriverDashboardStats = {
//   incoming: number;
//   inProgress: number;
//   completed: number;
// };

// export type DriverDashboardResponse = {
//   stats: DriverDashboardStats;
//   tasks: { items: any[] };
//   pickupRequests: { items: any[] };
// };

// function normalizeDashboard(payload: any): DriverDashboardResponse {
//   const root = payload?.data ?? payload;


//   const statsRaw = root?.stats ?? root?.summary ?? root?.counts ?? {};

//   return {
//     stats: {
//       incoming: Number(statsRaw?.incoming ?? statsRaw?.waiting ?? 0),
//       inProgress: Number(statsRaw?.inProgress ?? statsRaw?.processing ?? 0),
//       completed: Number(statsRaw?.completed ?? statsRaw?.done ?? 0),
//     },
//     tasks: {
//       items: root?.tasks?.items ?? root?.tasks ?? [],
//     },
//     pickupRequests: {
//       items: root?.pickupRequests?.items ?? root?.pickupRequests ?? [],
//     },
//   };
// }

// export async function getDriverDashboard(params: {
//   pageSize: number;
//   taskPage: number;
//   pickupPage: number;
// }) {
//   const res = await api.get("/driver/dashboard", { params });

//   return normalizeDashboard(res);
// }

// export type DriverDashboardParams = {
//   pageSize: number;
//   taskPage: number;
//   pickupPage: number;
// };

// export async function driverDashboardApi(params: DriverDashboardParams) {
//   const res = await api.get("/driver/dashboard", { params });
//   return res.data; 
// }

// export async function claimPickupApi(pickupId: number) {
//   const res = await api.post(`/driver/pickups/${pickupId}/claim`);
//   return res.data;
// }

// export async function pickupPickedUpApi(pickupId: number) {
//   const res = await api.post(`/driver/pickups/${pickupId}/picked-up`);
//   return res.data;
// }

// export async function pickupArrivedOutletApi(pickupId: number) {
//   const res = await api.post(`/driver/pickups/${pickupId}/arrived`);
//   return res.data;
// }

import { api } from "@/lib/api";

export type DriverDashboardParams = {
  pageSize: number;
  taskPage: number;
  pickupPage: number;
};

export async function getDriverDashboardApi(params: DriverDashboardParams) {
  const res = await api.get("/driver/dashboard", { params });
  return res.data;
}

export async function claimPickupApi(pickupId: number) {
  const res = await api.post(`/driver/pickups/${pickupId}/claim`);
  return res.data;
}

export async function startTaskApi(taskId: number) {
  const res = await api.post(`/driver/tasks/${taskId}/start`);
  return res.data;
}

export async function pickupPickedUpApi(taskId: number) {
  const res = await api.post(`/driver/pickups/${taskId}/picked-up`);
  return res.data;
}

export async function pickupArrivedApi(taskId: number) {
  const res = await api.post(`/driver/pickups/${taskId}/arrived`);
  return res.data;
}