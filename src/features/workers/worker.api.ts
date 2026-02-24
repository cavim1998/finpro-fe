import { api } from "@/lib/api";
import type { StationType } from "@/types";

export type StationTypeCode = "WASHING" | "IRONING" | "PACKING";

export type WorkerOrdersScope = "incoming" | "my" | "completed";
export type WorkerOrderKind = "INCOMING" | "MY_TASKS" | "COMPLETED";

export type GetStationOrdersParams = {
  stationType: StationTypeCode;
  scope: WorkerOrdersScope;
  page: number;
  limit: number;
};

export async function getStationStatsApi(stationType: StationTypeCode) {
  const res = await api.get(`/worker/stations/${stationType}/stats`);
  return res.data;
}

export async function getStationOrdersApi(params: GetStationOrdersParams) {
  const { stationType, ...query } = params;

  const res = await api.get(`/worker/stations/${stationType}/orders`, {
    params: query,
  });
  return res.data;
}

export async function getWorkerStationOrders(
  stationType: StationType | StationTypeCode,
  kind: WorkerOrderKind,
  page = 1,
  limit = 10,
) {
  const scopeMap: Record<WorkerOrderKind, WorkerOrdersScope> = {
    INCOMING: "incoming",
    MY_TASKS: "my",
    COMPLETED: "completed",
  };

  const res = await getStationOrdersApi({
    stationType: stationType as StationTypeCode,
    scope: scopeMap[kind],
    page,
    limit,
  });
  const data = res?.data ?? res;
  return data?.items ?? [];
}

export async function claimOrderApi(stationType: StationTypeCode, orderId: number) {
  const res = await api.post(`/worker/stations/${stationType}/${orderId}/claim`);
  return res.data;
}
