"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  draftStartDate: string;
  draftEndDate: string;
  sortOrder: "asc" | "desc";
  disabled: boolean;
  onDraftStartDateChange: (value: string) => void;
  onDraftEndDateChange: (value: string) => void;
  onApply: () => void;
  onResetMonth: () => void;
  onToggleSortOrder: () => void;
};

export default function AttendanceHistoryFilters({
  draftStartDate,
  draftEndDate,
  sortOrder,
  disabled,
  onDraftStartDateChange,
  onDraftEndDateChange,
  onApply,
  onResetMonth,
  onToggleSortOrder,
}: Props) {
  return (
    <>
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

      <div className="flex items-center gap-2">
        <Button
          onClick={onApply}
          disabled={disabled}
          className="bg-[#1DACBC]/10 text-[#138A96] hover:bg-[#1DACBC]/15"
        >
          Terapkan Filter
        </Button>
        <Button
          variant="outline"
          onClick={onResetMonth}
          disabled={disabled}
          className="border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5"
        >
          Bulan Ini
        </Button>
        <Button
          variant="outline"
          onClick={onToggleSortOrder}
          disabled={disabled}
          className="border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5"
        >
          Sort: {sortOrder === "asc" ? "Terlama" : "Terbaru"}
        </Button>
      </div>
    </>
  );
}
