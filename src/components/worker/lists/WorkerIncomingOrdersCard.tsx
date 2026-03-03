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
  totalItems: number | null;
  pageSize: number;
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
  totalItems,
  pageSize,
  isLoading,
  isError,
  isFetching,
  claimPending,
  onPrevPage,
  onNextPage,
  onClaim,
}: Props) {
  const theme = getIncomingListTheme();
  const pageLabel = getPageLabel(incomingPage, pageSize, totalItems, hasNextIncomingPage);

  return (
    <Card className={`flex h-full min-h-[25rem] flex-col rounded-2xl transition-all ${theme.containerClass}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className={`text-base ${theme.accentClass}`}>{labels.incomingTitle}</CardTitle>
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href={ordersHref}>
            {labels.viewAll} <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        {!isAllowed ? (
          <div className="text-sm text-muted-foreground">Silakan check-in dulu.</div>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : isError ? (
          <div className="text-sm text-destructive">Gagal memuat data.</div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
              {labels.emptyIncoming}
            </div>
            {incomingPage > 1 ? (
              <div className="pt-6">
                <Button size="sm" variant="outline" onClick={onPrevPage}>
                  prev
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              {items.map((item) => (
                <WorkerListOrderRow
                  key={item.orderStationId}
                  item={item}
                  accentClassName={theme.itemAccentClass}
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
              {items.length === 1 ? <div aria-hidden className="min-h-[9.25rem]" /> : null}
            </div>

            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant="outline"
                onClick={onPrevPage}
                disabled={incomingPage === 1 || isFetching}
              >
                Prev
              </Button>

              <div className="text-center text-xs text-muted-foreground">{pageLabel}</div>

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

function getPageLabel(
  currentPage: number,
  pageSize: number,
  totalItems: number | null,
  hasNextPage: boolean,
) {
  if (!hasNextPage) {
    return `Page ${currentPage} dari ${currentPage}`;
  }

  const totalPages =
    Number.isFinite(totalItems) && totalItems !== null
      ? Math.max(currentPage + 1, Math.ceil(totalItems / pageSize))
      : currentPage + 1;

  return `Page ${currentPage} dari ${totalPages}`;
}
