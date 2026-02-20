"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import * as React from "react";
import DriverPickupRequestCard from "./DriverPickupRequestCard";

type Props = {
  isAllowed: boolean;
  pickupRequests: any[];
};

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export default function DriverPickupRequestList({
  isAllowed,
  pickupRequests,
}: Props) {
  const pageSize = 5;
  const [pickupPage, setPickupPage] = React.useState(1);

  const pickupTotalPages = Math.max(
    1,
    Math.ceil(pickupRequests.length / pageSize),
  );
  const pickupPageItems = paginate(pickupRequests, pickupPage, pageSize);

  React.useEffect(() => {
    if (pickupPage > pickupTotalPages) setPickupPage(pickupTotalPages);
  }, [pickupPage, pickupTotalPages]);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Pickup Requests</CardTitle>
        <Link
          href="/driver/pickups"
          className="text-l text-primary font-medium border p-1.5 rounded-xl"
        >
          View all
        </Link>
      </CardHeader>

      <CardContent className="space-y-3">
        {!isAllowed ? (
          <p className="text-sm text-muted-foreground">
            Check-in dulu untuk melihat pickup request.
          </p>
        ) : pickupPageItems.length > 0 ? (
          <div className="space-y-2">
            {pickupPageItems.map((p) => (
              <DriverPickupRequestCard
  key={p.id}
  pickup={p}
  dashboardParams={{ pageSize, taskPage: 1, pickupPage }}
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
            onClick={() => setPickupPage((p) => Math.max(1, p - 1))}
            disabled={pickupPage <= 1}
          >
            Prev
          </Button>

          <p className="text-xs text-muted-foreground">
            Page {pickupPage} / {pickupTotalPages}
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPickupPage((p) => Math.min(pickupTotalPages, p + 1))
            }
            disabled={pickupPage >= pickupTotalPages}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}