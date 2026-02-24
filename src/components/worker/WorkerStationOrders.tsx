"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkerStationOrders } from "@/features/workers/useWorkerStationOrders";
import type { StationType } from "@/types";
import { ClipboardList, Inbox } from "lucide-react";
import WorkerOrderCard from "./WorkerOrderCard";
import type { WorkerOrderCard as WorkerOrderCardItem } from "@/types/worker-station";

type Labels = {
  myTasksTitle: string;
  incomingTitle: string;
  viewAll: string;
  emptyMyTasks: string;
  emptyIncoming: string;
};

type HeaderCopy = {
  title: string;
  subtitle?: string;
};

type Props = {
  stationType: StationType;
  basePath: string;
  header: HeaderCopy;

  listsLabels: Labels;

  theme?: {
    badgeClass?: string;
  };
};

function MiniList({
  items,
  emptyText,
  onItemClick,
}: {
  items: Array<Record<string, unknown>> | undefined;
  emptyText: string;
  onItemClick?: (orderId: string | number) => void;
}) {
  const toNumber = (value: unknown, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const normalizeStatus = (value: unknown): WorkerOrderCardItem["stationStatus"] => {
    const status = String(value ?? "").toUpperCase();
    if (status === "IN_PROGRESS") return "IN_PROGRESS";
    if (status === "WAITING_BYPASS") return "WAITING_BYPASS";
    if (status === "COMPLETED") return "COMPLETED";
    return "PENDING";
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-6 text-center">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 5).map((o, idx) => {
        const rawOrderId = o.orderId ?? o.id ?? idx;
        const orderId =
          typeof rawOrderId === "string" || typeof rawOrderId === "number"
            ? rawOrderId
            : idx;

        const item: WorkerOrderCardItem = {
          orderStationId: toNumber(o.orderStationId ?? o.id, idx + 1),
          orderId: String(orderId),
          orderNo: String(o.orderNo ?? o.id ?? "-"),
          customerName: String(o.customerName ?? "-"),
          clothesCount: toNumber(o.clothesCount ?? o.itemsCount, 0),
          totalKg: toNumber(o.totalKg ?? o.weightKg, 0),
          enteredAt: String(o.enteredAt ?? o.createdAt ?? new Date().toISOString()),
          stationStatus: normalizeStatus(o.stationStatus ?? o.status),
        };

        return (
          <WorkerOrderCard
            key={item.orderStationId}
            item={item}
            onClick={() => onItemClick?.(item.orderId)}
          />
        );
      })}
    </div>
  );
}

export function WorkerStationOrders({
  stationType,
  basePath,
  header,
  listsLabels,
  theme,
}: Props) {
  const myTasksQ = useWorkerStationOrders({
    stationType,
    kind: "MY_TASKS",
  });
  const incomingQ = useWorkerStationOrders({
    stationType,
    kind: "INCOMING",
  });

  return (
    <div className="container mx-auto space-y-6 pb-24">
      <div className="px-4 pt-4">
        <div className="rounded-2xl border p-4">
          <div className="text-lg font-semibold">{header.title}</div>
          {header.subtitle ? (
            <div className="text-sm text-muted-foreground">
              {header.subtitle}
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-4 grid gap-4">
        {/* My Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className={`h-5 w-5 ${theme?.badgeClass ?? ""}`} />
              {listsLabels.myTasksTitle}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {myTasksQ.isLoading ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                Loading...
              </div>
            ) : myTasksQ.isError ? (
              <div className="text-sm text-destructive py-6 text-center">
                Gagal memuat data.
              </div>
            ) : (
              <MiniList
                items={myTasksQ.data as Array<Record<string, unknown>>}
                emptyText={listsLabels.emptyMyTasks}
                onItemClick={(id) => {
                  console.log("clicked order:", id);
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Incoming */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Inbox className={`h-5 w-5 ${theme?.badgeClass ?? ""}`} />
              {listsLabels.incomingTitle}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {incomingQ.isLoading ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                Loading...
              </div>
            ) : incomingQ.isError ? (
              <div className="text-sm text-destructive py-6 text-center">
                Gagal memuat data.
              </div>
            ) : (
              <MiniList
                items={incomingQ.data as Array<Record<string, unknown>>}
                emptyText={listsLabels.emptyIncoming}
                onItemClick={(id) => {
                  console.log("clicked incoming order:", id);
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
