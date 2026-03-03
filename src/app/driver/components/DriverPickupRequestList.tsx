"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { DriverDashboardParams } from "@/features/driver/driver.api";
import DriverPickupRequestCard from "./DriverPickupRequestCard";

type PickupLike = Record<string, unknown>;

type Props = {
  isAllowed: boolean;
  pickupRequests: PickupLike[];
  dashboardParams: DriverDashboardParams;
  page: number;
  hasNextPage: boolean;
  totalItems?: number | null;
  pageSize?: number;
  loading?: boolean;
  onPrev: () => void;
  onNext: () => void;
  showViewAll?: boolean;
  viewAllHref?: string;
  title?: string;
};

export default function DriverPickupRequestList({
  isAllowed,
  pickupRequests,
  dashboardParams,
  page,
  hasNextPage,
  totalItems = null,
  pageSize = pickupRequests.length,
  loading,
  onPrev,
  onNext,
  showViewAll = true,
  viewAllHref = "/driver/pickups",
  title = "Incoming Task",
}: Props) {
  const getPickupKey = (pickup: PickupLike, index: number) => {
    const id = pickup.id ?? pickup.pickupId ?? pickup.pickup_id ?? pickup.orderId ?? pickup.order_id;
    if (typeof id === "string" || typeof id === "number") return String(id);
    return `pickup-${page}-${index}`;
  };
  const pageLabel = getPageLabel(page, pageSize, totalItems, hasNextPage);

  return (
    <Card className="flex h-full min-h-[25rem] flex-col rounded-2xl border-[#1DACBC]/30 shadow-card transition-shadow hover:shadow-[0_16px_36px_rgba(29,172,188,0.16)]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl text-[#1DACBC]">{title}</CardTitle>
        {showViewAll ? (
          <Button asChild variant="ghost" size="sm" className="gap-1 text-[#1DACBC]">
            <Link href={viewAllHref}>
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        {!isAllowed ? (
          <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
            Check-in dulu untuk melihat pickup request.
          </div>
        ) : loading ? (
          <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : pickupRequests.length > 0 ? (
          <div className="space-y-6">
            <div className="space-y-3">
              {pickupRequests.map((p, index) => (
                <DriverPickupRequestCard
                  key={getPickupKey(p, index)}
                  pickup={p}
                  dashboardParams={dashboardParams}
                  disabled={!isAllowed}
                />
              ))}
              {pickupRequests.length === 1 ? <div aria-hidden className="min-h-[7.25rem]" /> : null}
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                disabled={page <= 1 || !!loading}
              >
                Prev
              </Button>

              <div className="text-center text-xs text-muted-foreground">{pageLabel}</div>

              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!hasNextPage || !!loading}
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
              Belum ada pickup request.
            </div>

            <div className="flex items-center justify-between pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                disabled={page <= 1 || !!loading}
              >
                Prev
              </Button>

              <div className="text-center text-xs text-muted-foreground">{pageLabel}</div>

              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!hasNextPage || !!loading}
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
  const totalPages =
    Number.isFinite(totalItems) && totalItems !== null
      ? Math.max(1, Math.ceil(totalItems / pageSize))
      : hasNextPage
        ? currentPage + 1
        : currentPage;

  return `Page ${currentPage} dari ${totalPages}`;
}
