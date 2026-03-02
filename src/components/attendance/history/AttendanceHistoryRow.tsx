"use client";

import type { AttendanceHistoryItem } from "@/hooks/api/useAttendanceHistory";
import { formatDate, formatTime } from "./shared";

type Props = {
  item: AttendanceHistoryItem;
};

export default function AttendanceHistoryRow({ item }: Props) {
  const status = item.clockOutAt ? "Completed" : item.clockInAt ? "On Duty" : "No Activity";
  const statusClassName =
    status === "On Duty"
      ? "border-green-200 bg-green-50 text-green-700"
      : status === "No Activity"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-border";

  return (
    <div
      className="rounded-xl border border-[#1DACBC]/20 p-3 text-sm transition-shadow hover:shadow-[0_12px_28px_rgba(29,172,188,0.1)]"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-[#138A96]">{formatDate(item.date)}</p>
        <span className={`rounded-md border px-2 py-1 text-xs ${statusClassName}`}>{status}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className={item.clockInAt ? "text-green-700" : "text-red-700"}>
          Clock In: {item.clockInAt ? formatTime(item.clockInAt) : "Worker tidak clock in"}
        </div>
        <div className={item.clockOutAt ? "text-green-700" : "text-red-700"}>
          Clock Out: {item.clockOutAt ? formatTime(item.clockOutAt) : "Worker tidak clock out"}
        </div>
      </div>
      {item.notes ? <p className="mt-2 text-xs text-muted-foreground">Notes: {item.notes}</p> : null}
    </div>
  );
}
