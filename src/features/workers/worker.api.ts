import { api } from "@/lib/api";

export type StationTypeCode = "WASHING" | "IRONING" | "PACKING";

export type WorkerOrdersScope = "incoming" | "my" | "completed";

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

export async function claimOrderApi(stationType: StationTypeCode, orderId: number) {
  const res = await api.post(`/worker/stations/${stationType}/${orderId}/claim`);
  return res.data;
}