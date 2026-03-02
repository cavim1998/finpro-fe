"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type Props = {
  isReadOnly: boolean;
  isMatched: boolean;
  isBypassLocked: boolean;
  actionLoading: boolean;
  hasAnyItem: boolean;
  hasInvalidItemId: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
};

export default function WorkerOrderDetailActions({
  isReadOnly,
  isMatched,
  isBypassLocked,
  actionLoading,
  hasAnyItem,
  hasInvalidItemId,
  reason,
  onReasonChange,
  onSubmit,
}: Props) {
  if (isReadOnly) return null;

  return (
    <>
      {!isMatched ? (
        <div className="space-y-2 rounded-xl border border-[#1DACBC]/20 p-4">
          <div className="text-sm font-medium text-[#138A96]">Alasan Request ke Outlet Admin</div>
          <Textarea
            className="border-[#1DACBC]/20 focus-visible:ring-[#1DACBC]/30"
            placeholder="Contoh: ada pakaian rusak / item tidak ditemukan / qty berbeda"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            disabled={actionLoading || isBypassLocked}
          />
        </div>
      ) : null}

      <Button
        className="w-full rounded-xl bg-[#1DACBC] text-white hover:bg-[#1697A5]"
        onClick={onSubmit}
        disabled={
          isBypassLocked ||
          actionLoading ||
          !hasAnyItem ||
          hasInvalidItemId ||
          (!isMatched && !reason.trim())
        }
      >
        {actionLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
          </>
        ) : isMatched ? (
          "Selesaikan pekerjaan"
        ) : (
          "Request ke outlet admin"
        )}
      </Button>
    </>
  );
}
