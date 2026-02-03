"use client";

import * as React from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useAttendance } from "@/contexts/AttendanceContext";
import { CheckInOutDialog } from "./CheckInOutDialog";

export function CheckInGate() {
  const { user } = useAuth();
  const { checkIn } = useAttendance(); 
  const [open, setOpen] = React.useState(false);

  const name = user?.profile?.fullName || "Worker";

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center p-4">
        {/* Tombol yang memicu popup card gambar 1 */}
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-3xl bg-[#54E1E6] p-8 text-center shadow-lg"
        >
          <p className="text-2xl font-bold text-black">Tap untuk Check In</p>
          <p className="mt-2 text-black/80">
            Kamu harus check in dulu sebelum masuk dashboard.
          </p>

          <div className="mt-6 rounded-full bg-white py-4 text-3xl font-extrabold text-black">
            check in
          </div>
        </button>
      </div>

      <CheckInOutDialog
        open={open}
        onOpenChange={setOpen}
        mode="checkin"
        name={name}
        onConfirm={() => {
          if (!user.outletStaffId) return;
          checkIn(
            user.outletStaffId,
            name,
            user.role,
            user.outletId,
            user.workerStation
          );
        }}
      />
    </div>
  );
}