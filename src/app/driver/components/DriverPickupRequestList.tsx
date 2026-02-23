"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import type { DriverDashboardParams } from "@/features/driver/driver.api";
import DriverPickupRequestCard from "./DriverPickupRequestCard";

type Props = {
  isAllowed: boolean;
  pickupRequests: unknown[];
  dashboardParams: DriverDashboardParams;
  page: number;
  hasNextPage: boolean;
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
  loading,
  onPrev,
  onNext,
  showViewAll = true,
  viewAllHref = "/driver/pickups",
  title = "Pickup Requests",
}: Props) {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl">{title}</CardTitle>
        {showViewAll ? (
          <Link
            href={viewAllHref}
            className="text-l text-primary font-medium border p-1.5 rounded-xl"
          >
            View all
          </Link>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3">
        {!isAllowed ? (
          <p className="text-sm text-muted-foreground">
            Check-in dulu untuk melihat pickup request.
          </p>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : pickupRequests.length > 0 ? (
          <div className="space-y-2">
            {pickupRequests.map((p) => (
              <DriverPickupRequestCard
                key={p.id}
                pickup={p}
                dashboardParams={dashboardParams}
                disabled={!isAllowed}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Belum ada pickup request.
          </p>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={page <= 1 || !!loading}
          >
            Prev
          </Button>

          <p className="text-xs text-muted-foreground">
            Page {page}
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={!hasNextPage || !!loading}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
