"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkerOrderListItem } from "@/hooks/api/useWorkerStations";
import type { StationType } from "@/types";
import { Loader2 } from "lucide-react";
import WorkerListOrderRow from "./WorkerListOrderRow";
import type { WorkerListsLabels } from "./shared";
import { getStationListTheme } from "./shared";

type Props = {
  station: StationType;
  isAllowed: boolean;
  labels: WorkerListsLabels;
  items: WorkerOrderListItem[];
  isLoading: boolean;
  isError: boolean;
};

export default function WorkerMyTasksCard({
  station,
  isAllowed,
  labels,
  items,
  isLoading,
  isError,
}: Props) {
  const theme = getStationListTheme(station);

  return (
    <Card className={`rounded-2xl transition-all ${theme.containerClass}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className={`text-base ${theme.accentClass}`}>{labels.myTasksTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {!isAllowed ? (
          <div className="text-sm text-muted-foreground">Silakan check-in dulu.</div>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : isError ? (
          <div className="text-sm text-destructive">Gagal memuat data.</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">{labels.emptyMyTasks}</div>
        ) : (
          <div>
            {items.map((item) => (
              <WorkerListOrderRow
                key={item.orderStationId}
                item={item}
                hoverClassName={theme.itemHoverClass}
                right={
                  <Button asChild size="sm" variant="outline" className="rounded-xl">
                    <Link href={`/worker/${station.toLowerCase()}/order/${encodeURIComponent(item.orderId)}`}>
                      View detail
                    </Link>
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
