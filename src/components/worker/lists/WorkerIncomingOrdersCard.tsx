"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkerOrderListItem } from "@/hooks/api/useWorkerStations";
import { ChevronRight, Loader2 } from "lucide-react";
import WorkerListOrderRow from "./WorkerListOrderRow";
import type { WorkerListsLabels } from "./shared";
import { getIncomingListTheme } from "./shared";

type Props = {
  isAllowed: boolean;
  labels: WorkerListsLabels;
  ordersHref: string;
  items: WorkerOrderListItem[];
  incomingPage: number;
  hasNextIncomingPage: boolean;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  claimPending: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onClaim: (item: WorkerOrderListItem) => void;
};

export default function WorkerIncomingOrdersCard({
  isAllowed,
  labels,
  ordersHref,
  items,
  incomingPage,
  hasNextIncomingPage,
  isLoading,
  isError,
  isFetching,
  claimPending,
  onPrevPage,
  onNextPage,
  onClaim,
}: Props) {
  const theme = getIncomingListTheme();

  return (
    <Card className={`rounded-2xl transition-all ${theme.containerClass}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className={`text-base ${theme.accentClass}`}>{labels.incomingTitle}</CardTitle>
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href={ordersHref}>
            {labels.viewAll} <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
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
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">{labels.emptyIncoming}</div>
            {incomingPage > 1 ? (
              <Button size="sm" variant="outline" onClick={onPrevPage}>
                Halaman sebelumnya
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              {items.map((item) => (
                <WorkerListOrderRow
                  key={item.orderStationId}
                  item={item}
                  hoverClassName={theme.itemHoverClass}
                  right={
                    <Button
                      size="sm"
                      className="rounded-xl"
                      disabled={claimPending}
                      onClick={() => onClaim(item)}
                    >
                      {claimPending ? "..." : "Claim"}
                    </Button>
                  }
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={onPrevPage}
                disabled={incomingPage === 1 || isFetching}
              >
                Prev
              </Button>

              <div className="text-xs text-muted-foreground">Page {incomingPage}</div>

              <Button
                size="sm"
                variant="outline"
                onClick={onNextPage}
                disabled={!hasNextIncomingPage || isFetching}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
