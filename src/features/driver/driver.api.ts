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

// export async function claimPickupApi(pickupId: string) {
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

export type DriverOrderDetailParams = {
  id: number;
  type?: "task" | "pickup";
};

function sanitizePageSize(pageSize: number) {
  const size = Number.isFinite(pageSize) ? Math.floor(pageSize) : 10;
  return Math.min(50, Math.max(1, size));
}

export async function getDriverDashboardApi(params: DriverDashboardParams) {
  const safeParams: DriverDashboardParams = {
    ...params,
    pageSize: sanitizePageSize(params.pageSize),
  };
  const res = await api.get("/driver/dashboard", { params: safeParams });
  return res.data;
}

export async function claimPickupApi(pickupId: string) {
  const res = await api.post(`/driver/pickups/${pickupId}/claim`);
  return res.data;
}

export async function claimDeliveryApi(orderId: string) {
  const res = await api.post(`/driver/orders/${orderId}/claim`);
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

export async function completeDeliveryApi(taskId: number) {
  const res = await api.post(`/driver/deliveries/${taskId}/complete`);
  return res.data;
}

export async function getDriverOrderDetailApi(params: DriverOrderDetailParams) {
  const { id, type } = params;
  const pageSize = 50;

  const findById = (arr: unknown[]) =>
    arr.find((it) => {
      if (typeof it !== "object" || it === null) return false;
      return Number((it as { id?: unknown }).id) === id;
    });

  // Search across dashboard pages because detail endpoint may not be available on BE.
  let page = 1;
  let maxPages = 1;
  while (page <= maxPages) {
    const res = await getDriverDashboardApi({
      pageSize,
      taskPage: page,
      pickupPage: page,
    });
    const root = res?.data ?? res;
    const tasks = Array.isArray(root?.tasks?.items) ? root.tasks.items : [];
    const pickups = Array.isArray(root?.pickupRequests?.items) ? root.pickupRequests.items : [];

    const task = findById(tasks);
    const pickup = findById(pickups);

    if (type === "task" && task) {
      return { data: { task, pickupRequest: (task as { pickupRequest?: unknown }).pickupRequest ?? null } };
    }
    if (type === "pickup" && pickup) {
      return { data: { pickupRequest: pickup } };
    }
    if (!type && task) {
      return { data: { task, pickupRequest: (task as { pickupRequest?: unknown }).pickupRequest ?? null } };
    }
    if (!type && pickup) {
      return { data: { pickupRequest: pickup } };
    }

    const taskTotalPages = Number(root?.tasks?.totalPages ?? 1);
    const pickupTotalPages = Number(root?.pickupRequests?.totalPages ?? 1);
    maxPages = Math.max(taskTotalPages || 1, pickupTotalPages || 1);
    page += 1;
  }

  throw new Error(type === "pickup" ? "Pickup detail not found" : "Task detail not found");
}
