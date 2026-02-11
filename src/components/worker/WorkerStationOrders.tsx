"use client";

import Link from "next/link";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Inbox } from "lucide-react";
import type { StationType, Order } from "@/types";
import { useWorkerStationOrders } from "@/features/workers/useWorkerStationOrders";
import { WorkerOrderCard } from "./WorkerOrderCard";
import type { WorkerOrderListItem } from "@/types/worker-order";

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
  statusLabel,
  accentClassName,
}: {
  items: any[] | undefined; // nanti kita rapihin type-nya ke Order beneran
  emptyText: string;
  onItemClick?: (orderId: string | number) => void;

  statusLabel: string; // ex: "Washing"
  accentClassName?: string;
}) {
  if (!items || items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-6 text-center">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 5).map((o) => (
        <WorkerOrderCard
          key={o.id}
          orderId={o.id}
          customerName={o.customerName ?? o.customer?.name ?? "-"}
          clothesCount={o.clothesCount ?? o.itemsCount ?? 0}
          totalKg={o.totalKg ?? o.weightKg ?? 0}
          enteredAt={o.enteredAt ?? o.createdAt ?? new Date().toISOString()}
          statusLabel={statusLabel}
          accentClassName={accentClassName}
          onClick={() => onItemClick?.(o.id)}
        />
      ))}
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
                items={myTasksQ.data}
                emptyText={listsLabels.emptyMyTasks}
                statusLabel="Washing"
                accentClassName={theme?.badgeClass}
                onItemClick={(id) => {
                  // step selanjutnya: buka modal konfirmasi jumlah selesai
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
                items={incomingQ.data}
                emptyText={listsLabels.emptyIncoming}
                statusLabel="Washing"
                accentClassName={theme?.badgeClass}
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
