"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkerCompletedOrdersTheme } from "./shared";
import { Search } from "lucide-react";

type Props = {
  theme: WorkerCompletedOrdersTheme;
  searchInput: string;
  draftStartDate: string;
  draftEndDate: string;
  sortOrder: "asc" | "desc";
  disabled: boolean;
  onSearchChange: (value: string) => void;
  onDraftStartDateChange: (value: string) => void;
  onDraftEndDateChange: (value: string) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  onToggleSort: () => void;
};

export default function WorkerCompletedOrdersFilters({
  theme,
  searchInput,
  draftStartDate,
  draftEndDate,
  sortOrder,
  disabled,
  onSearchChange,
  onDraftStartDateChange,
  onDraftEndDateChange,
  onApplyFilters,
  onResetFilters,
  onToggleSort,
}: Props) {
  return (
    <>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cari berdasarkan Order ID"
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Start Date</p>
          <Input
            type="date"
            value={draftStartDate}
            onChange={(event) => onDraftStartDateChange(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">End Date</p>
          <Input
            type="date"
            value={draftEndDate}
            onChange={(event) => onDraftEndDateChange(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button className={theme.solidButtonClass} onClick={onApplyFilters} disabled={disabled}>
          Terapkan Filter
        </Button>
        <Button
          variant="outline"
          className={theme.ghostButtonClass}
          onClick={onResetFilters}
          disabled={disabled}
        >
          Reset
        </Button>
        <Button
          variant="outline"
          className={theme.ghostButtonClass}
          onClick={onToggleSort}
          disabled={disabled}
        >
          Sort: {sortOrder === "asc" ? "Terlama" : "Terbaru"}
        </Button>
      </div>
    </>
  );
}
