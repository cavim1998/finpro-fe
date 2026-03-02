"use client";

import { Button } from "@/components/ui/button";
import type { ItemCounter } from "./shared";
import { Minus, Plus } from "lucide-react";

type Props = {
  items: ItemCounter[];
  isReadOnly: boolean;
  isBypassLocked: boolean;
  actionLoading: boolean;
  hasInvalidItemId: boolean;
  onChangeQty: (itemId: number, value: number) => void;
};

export default function WorkerOrderItemCounters({
  items,
  isReadOnly,
  isBypassLocked,
  actionLoading,
  hasInvalidItemId,
  onChangeQty,
}: Props) {
  return (
    <div className="rounded-xl border border-[#1DACBC]/20 p-4">
      <div className="mb-2 font-semibold text-[#138A96]">Hitung Ulang Item</div>
      {isReadOnly ? (
        <div className="mb-3 text-sm text-muted-foreground">
          Mode detail read-only. Aksi perubahan dinonaktifkan.
        </div>
      ) : null}
      {isBypassLocked ? (
        <div className="mb-3 text-sm text-amber-700">
          Request bypass sedang diproses. Perubahan item dikunci sampai admin memberi keputusan.
        </div>
      ) : null}
      {hasInvalidItemId ? (
        <div className="mb-3 text-sm text-destructive">
          Beberapa item tidak punya `itemId` valid dari backend, jadi belum bisa submit.
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => {
            const matched = item.actualQty === item.expectedQty;

            return (
              <div
                key={`${item.itemId}-${item.name}`}
                className="rounded-lg border border-[#1DACBC]/15 px-3 py-2 text-sm transition-shadow hover:shadow-[0_12px_28px_rgba(29,172,188,0.1)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">Qty order: {item.expectedQty}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5"
                      onClick={() => onChangeQty(item.itemId, item.actualQty - 1)}
                      disabled={isReadOnly || isBypassLocked || actionLoading || item.actualQty <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <div className="w-10 text-center font-semibold">{item.actualQty}</div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5"
                      onClick={() => onChangeQty(item.itemId, item.actualQty + 1)}
                      disabled={isReadOnly || isBypassLocked || actionLoading}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-2 text-xs">
                  {matched ? (
                    <span className="text-emerald-600">Qty sesuai</span>
                  ) : (
                    <span className="text-amber-600">Qty belum sesuai</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Belum ada data item.</div>
      )}
    </div>
  );
}
