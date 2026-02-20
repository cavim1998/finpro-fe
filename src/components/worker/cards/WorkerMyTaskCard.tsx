"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { StationTypeCode } from "@/features/workers/worker.api";

function getCustomerName(order: any) {
  const prof = order?.customerProfile || order?.customer?.profile;
  return (
    prof?.fullName ||
    prof?.name ||
    order?.customerName ||
    order?.customer?.email ||
    "Pelanggan"
  );
}

type Props = {
  stationType: StationTypeCode;
  order: any;
  disabled?: boolean;
};

export default function WorkerMyTaskCard({ stationType, order, disabled }: Props) {
  const router = useRouter();
  const customerName = getCustomerName(order);

  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-base line-clamp-1">{customerName}</p>

        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => {
            router.push(`/worker/order?stationType=${stationType}&orderId=${order?.id}`);
          }}
        >
          Detail
        </Button>
      </div>
    </div>
  );
}