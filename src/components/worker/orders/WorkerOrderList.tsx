"use client";

import { WorkerOrderListItem } from "@/types/worker-order";
import WorkerOrderCard from "./WorkerOrderCard";

type Props = {
  items: WorkerOrderListItem[];
  badgeClassName?: string;
  emptyText?: string;

  onConfirmComplete?: (args: {
    id: WorkerOrderListItem["id"];
    completedClothesCount: number;
  }) => Promise<void> | void;
};

export default function WorkerOrderList({
  items,
  badgeClassName,
  emptyText = "Belum ada order.",
  onConfirmComplete,
}: Props) {
  if (!items?.length) {
    return (
      <div className="text-sm text-muted-foreground text-center py-6">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <WorkerOrderCard
          key={String(item.id)}
          item={item}
          badgeClassName={badgeClassName}
          onConfirmComplete={onConfirmComplete}
        />
      ))}
    </div>
  );
}
