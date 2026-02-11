import type { Order, StationType } from "@/types";
// nanti kalau backend sudah ada, pakai axiosInstance:
// import { axiosInstance } from "@/lib/axios";

export type WorkerOrderKind = "MY_TASKS" | "INCOMING";

export async function getWorkerStationOrders(
  stationType: StationType,
  kind: WorkerOrderKind
): Promise<Order[]> {
  // TODO (backend):
  // const res = await axiosInstance.get("/worker/orders", {
  //   params: { stationType, kind },
  // });
  // return res.data?.data ?? res.data;

  // sementara FE dulu:
  console.log("[getWorkerStationOrders] stub:", { stationType, kind });
  return [];
}