"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle2, ClipboardList, Truck } from "lucide-react";
import Link from "next/link";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";

type Props = {
  incoming: number;
  inProgress: number;
  completed: number;
};

export default function DriverStats({
  incoming,
  inProgress,
  completed,
}: Props) {
  const attendanceTodayQ = useAttendanceTodayQuery();
  const outletStaffId = Number(attendanceTodayQ.data?.outletStaffId ?? 0);
  const historyHref =
    Number.isFinite(outletStaffId) && outletStaffId > 0
      ? `/driver/history/${outletStaffId}`
      : "/driver/history";

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="rounded-2xl p-4 transition-shadow hover:shadow-[0_12px_28px_rgba(29,172,188,0.18)]">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-[#1DACBC]/10 p-3">
            <Truck className="h-5 w-5 text-[#1DACBC]" />
          </div>
          <div className="text-2xl font-bold text-[#1DACBC]">{incoming}</div>
          <div className="text-xs text-black">Incoming</div>
        </div>
      </Card>

      <Card className="rounded-2xl p-4 transition-shadow hover:shadow-[0_12px_28px_rgba(249,115,22,0.18)]">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-orange-500/10 p-3">
            <ClipboardList className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-500">{inProgress}</div>
          <div className="text-xs text-black">In Progress</div>
        </div>
      </Card>

      <Link href={historyHref} className="block">
        <Card className="cursor-pointer rounded-2xl p-4 transition-shadow hover:shadow-[0_12px_28px_rgba(34,197,94,0.18)]">
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-green-500/10 p-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{completed}</div>
            <div className="text-xs text-black">Completed</div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
