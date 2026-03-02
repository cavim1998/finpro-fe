"use client";

import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  canNext: boolean;
  disabled: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function AttendanceHistoryPagination({
  page,
  canNext,
  disabled,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        className="border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5"
        onClick={onPrev}
        disabled={page <= 1 || disabled}
      >
        Prev
      </Button>
      <p className="text-xs text-muted-foreground">Page {page}</p>
      <Button
        variant="outline"
        size="sm"
        className="border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5"
        onClick={onNext}
        disabled={!canNext || disabled}
      >
        Next
      </Button>
    </div>
  );
}
