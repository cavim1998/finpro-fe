"use client";

import { Button } from "@/components/ui/button";
import type { WorkerOrderListItem } from "@/hooks/api/useWorkerStations";
import type { StationType } from "@/types";

type Props = {
  items: WorkerOrderListItem[];
  station: StationType;
  workerOutletId: number;
  onClose: () => void;
  onNavigate: (href: string) => void;
};

export default function WorkerDashboardNotificationContent({
  items,
  station,
  workerOutletId,
  onClose,
  onNavigate,
}: Props) {
  if (items.length === 0) {
    return <div className="text-sm text-muted-foreground">Tidak ada task masuk.</div>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.orderStationId} className="rounded-xl border p-3 text-sm">
          <p className="font-semibold">#{item.orderNo}</p>
          <p className="text-muted-foreground">{item.customerName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.clothesCount} pakaian • {item.totalKg} kg
          </p>
        </div>
      ))}

      {workerOutletId > 0 ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            onClose();
            onNavigate(`/worker/${station.toLowerCase()}/orders/${workerOutletId}`);
          }}
        >
          Lihat Semua Incoming
        </Button>
      ) : null}
    </div>
  );
}
