"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import * as React from "react";

import ConfirmActionDialog from "@/app/attendance/components/ConfirmActionDialog";
import DriverStats from "./DriverStats";

type Props = {
  displayName: string;

  loadingToday: boolean;
  isCheckedIn: boolean;
  isCompleted: boolean;
  sinceText: string;

  onClockOut: () => Promise<void>;
  clockOutLoading: boolean;

  stats: {
    incoming: number;
    inProgress: number;
    completed: number;
  };

  dashboardLoading?: boolean;
};

export default function DriverHeader({
  displayName,
  loadingToday,
  isCheckedIn,
  isCompleted,
  sinceText,
  onClockOut,
  clockOutLoading,
  stats,
  dashboardLoading,
}: Props) {
  const [openClockOut, setOpenClockOut] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const statusText = React.useMemo(() => {
    if (loadingToday) return "Memuat status...";
    if (isCompleted) return "Shift selesai (locked sampai besok)";
    if (isCheckedIn) return "Sedang shift";
    return "Belum clock-in";
  }, [loadingToday, isCheckedIn, isCompleted]);

  const handleConfirmClockOut = async () => {
    setErrorMsg(null);
    try {
      await onClockOut();
      setOpenClockOut(false);
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message ?? "Clock-out gagal.");
    }
  };

  return (
    <div>
      <div className="p-4 pt-6 pb-8 rounded-b-3xl bg-gradient-to-r from-[#1dacbc] to-[#0b6c75]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-bold text-4xl">Selamat bekerja,</p>
            <h1 className="text-2xl font-bold">{displayName}!</h1>
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="notifications"
            className="border rounded-4xl"
          >
            <Bell className="text-white" />
          </Button>
        </div>

        <DriverStats
          incoming={dashboardLoading ? 0 : stats.incoming}
          inProgress={dashboardLoading ? 0 : stats.inProgress}
          completed={dashboardLoading ? 0 : stats.completed}
        />
      </div>

      <div className="p-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-xl">Attendance</p>
                <p className="text-2xl font-bold text-green-500">{statusText}</p>
                <p className="text-xl">
                  Clock in: {isCheckedIn ? sinceText : "-"}
                </p>
              </div>

              <Button
                variant="outline"
                className="min-w-[140px]"
                disabled={!isCheckedIn || isCompleted || clockOutLoading}
                onClick={() => setOpenClockOut(true)}
              >
                {clockOutLoading ? "Clocking Out..." : "Check Out"}
              </Button>
            </div>

            {errorMsg && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}
          </CardContent>
        </Card>

        <ConfirmActionDialog
          open={openClockOut}
          onOpenChange={setOpenClockOut}
          title="Konfirmasi Check Out"
          description="Apakah kamu yakin ingin check-out sekarang? Setelah check-out, shift akan terkunci sampai besok."
          confirmText="Ya, Check Out"
          cancelText="Batal"
          loading={clockOutLoading}
          onConfirm={handleConfirmClockOut}
        />
      </div>
    </div>
  );
}