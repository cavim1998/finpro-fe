"use client";

import { Button } from "@/components/ui/button";
import type { WorkerCompletedOrdersTheme } from "./shared";

type Props = {
  theme: WorkerCompletedOrdersTheme;
  currentPage: number;
  hasNextPage: boolean;
  disabled: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function WorkerCompletedOrdersPagination({
  theme,
  currentPage,
  hasNextPage,
  disabled,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className="flex items-center justify-between pt-1">
      <Button
        size="sm"
        variant="outline"
        className={theme.ghostButtonClass}
        onClick={onPrev}
        disabled={currentPage === 1 || disabled}
      >
        Prev
      </Button>

      <div className="text-xs text-muted-foreground">Page {currentPage}</div>

      <Button
        size="sm"
        variant="outline"
        className={theme.ghostButtonClass}
        onClick={onNext}
        disabled={!hasNextPage || disabled}
      >
        Next
      </Button>
    </div>
  );
}
