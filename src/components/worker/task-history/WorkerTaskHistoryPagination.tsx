"use client";

import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  canNext: boolean;
  disabled: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function WorkerTaskHistoryPagination({
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
        className="border-green-200 text-green-600 hover:bg-green-50"
        onClick={onPrev}
        disabled={page <= 1 || disabled}
      >
        Prev
      </Button>
      <p className="text-xs text-muted-foreground">Page {page}</p>
      <Button
        variant="outline"
        size="sm"
        className="border-green-200 text-green-600 hover:bg-green-50"
        onClick={onNext}
        disabled={!canNext || disabled}
      >
        Next
      </Button>
    </div>
  );
}
