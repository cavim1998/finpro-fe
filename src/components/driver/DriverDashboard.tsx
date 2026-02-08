"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Truck, ClipboardList, Clock } from "lucide-react";
import { useProfileQuery } from "@/hooks/api/useProfile";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { useClockOutMutation } from "@/hooks/api/useAttendanceMutations";
import ConfirmActionDialog from "@/app/attendance/components/ConfirmActionDialog";

function formatTime(d?: Date | string | null) {
  if (!d) return "-";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function DriverDashboard() {
  const router = useRouter();
  const profileQ = useProfileQuery();
  const attendanceQ = useAttendanceTodayQuery();
  const clockOutM = useClockOutMutation();
  const today = attendanceQ.data;
  const isCheckedIn = !!today?.isCheckedIn;
  const isCompleted = !!today?.isCompleted;

  const displayName =
    profileQ.data?.fullName || profileQ.data?.name || profileQ.data?.email || "Driver";

  const sinceText = formatTime(today?.log?.clockInAt ?? null);

  const [openClockOut, setOpenClockOut] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleConfirmClockOut = async () => {
    setErrorMsg(null);
    try {
      await clockOutM.mutateAsync();
      await attendanceQ.refetch();
      setOpenClockOut(false);
      router.push("/attendance?next=/driver");
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message ?? "Clock-out gagal.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="p-4 pt-6 pb-8 rounded-b-3xl bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-muted-foreground text-sm">Welcome back,</p>
            <h1 className="text-xl font-bold">{displayName}</h1>
            <p className="text-xs text-muted-foreground">
              {profileQ.isLoading ? "Memuat profil..." : "Driver Dashboard"}
            </p>
          </div>

          <Button variant="ghost" size="icon" aria-label="notifications">
            <Bell className="h-5 w-5" />
          </Button>
        </div>

        {/* Attendance summary */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">Attendance</p>
                <p className="text-sm text-muted-foreground">
                  {attendanceQ.isLoading
                    ? "Memuat status..."
                    : isCompleted
                      ? "Shift selesai (locked sampai besok)"
                      : isCheckedIn
                        ? "Sedang shift"
                        : "Belum clock-in"}
                </p>
                <p className="text-xs text-muted-foreground">Since: {isCheckedIn ? sinceText : "-"}</p>
              </div>

              <Button
                variant="outline"
                className="min-w-[140px]"
                disabled={!isCheckedIn || isCompleted || clockOutM.isPending}
                onClick={() => setOpenClockOut(true)}
              >
                {clockOutM.isPending ? "Clocking Out..." : "Clock Out"}
              </Button>
            </div>

            {errorMsg && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}
          </CardContent>
        </Card>
      </header>

      <div className="p-4 space-y-4 -mt-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4" /> Pickup Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                (Nanti kita sambungkan endpoint pickup)
              </p>
              <Link href="/driver/pickups">
                <Button className="w-full" disabled={!isCheckedIn || isCompleted}>
                  Open
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4" /> My Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                (Nanti kita sambungkan endpoint tasks/delivery)
              </p>
              <Link href="/driver/tasks">
                <Button className="w-full" variant="outline" disabled={!isCheckedIn || isCompleted}>
                  Open
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Reminder kalau belum check-in */}
        {!attendanceQ.isLoading && !isCheckedIn && !isCompleted && (
          <Card className="border">
            <CardContent className="py-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Kamu harus clock-in dulu sebelum mulai ambil pickup/delivery.
              </p>
              <Button
                className="ml-auto"
                onClick={() => router.push("/attendance?next=/driver")}
              >
                Go to Attendance
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirm Clock-out */}
      <ConfirmActionDialog
        open={openClockOut}
        onOpenChange={setOpenClockOut}
        title="Konfirmasi Clock Out"
        description="Apakah kamu yakin ingin clock-out sekarang? Setelah clock-out, shift akan terkunci sampai besok."
        confirmText="Ya, Clock Out"
        cancelText="Batal"
        loading={clockOutM.isPending}
        onConfirm={handleConfirmClockOut}
      />

      <BottomNav />
    </div>
  );
}