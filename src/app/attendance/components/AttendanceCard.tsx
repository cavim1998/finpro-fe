"use client";

import { useState } from "react";
import { formatDate, formatTime } from "./formatters";
import ConfirmActionDialog from "./ConfirmActionDialog";

type Props = {
  today: any;
  loadingToday: boolean;

  statusText: string;
  isCheckedIn: boolean;
  isCompleted: boolean;

  actionError: string | null;
  actionLoading: "in" | "out" | null;

  canClockIn: boolean;
  canClockOut: boolean;

  onClockIn: () => void;
  onClockOut: () => void;
  onRefresh: () => void;

  dashboardTarget: string;
  onGoDashboard: () => void;
};

export default function AttendanceCard({
  today,
  loadingToday,
  statusText,
  isCheckedIn,
  isCompleted,
  actionError,
  actionLoading,
  canClockIn,
  canClockOut,
  onClockIn,
  onClockOut,
  onRefresh,
  dashboardTarget,
  onGoDashboard,
}: Props) {
  const [openIn, setOpenIn] = useState(false);
  const [openOut, setOpenOut] = useState(false);

  return (
    <div className="pl-4 pr-4">
      <div className="rounded-xl border border-[#1dacbc] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl text-black font-bold">Tanggal</p>
            <p className="font-medium text-xl">
              {formatDate(today?.date ?? null)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl text-black font-bold">Status</p>
            <p
              className={`font-medium text-xl ${
                isCompleted ? "text-red-600" : isCheckedIn ? "text-green-700" : ""
              }`}
            >
              {loadingToday ? "Memuat..." : statusText}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-xl text-black font-bold">Clock In</p>
            <p className="font-medium">
              {formatTime(today?.log?.clockInAt ?? null)}
            </p>
          </div>
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-xl text-black font-bold">Clock Out</p>
            <p className="font-medium">
              {formatTime(today?.log?.clockOutAt ?? null)}
            </p>
          </div>
        </div>

        {actionError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setOpenIn(true)}
            disabled={!canClockIn}
            className={`px-4 py-2 rounded-lg border font-medium ${
              canClockIn
                ? "bg-green-500 text-white hover:bg-green-300 hover:text-black "
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {actionLoading === "in" ? "Clocking In..." : "Clock In"}
          </button>

          <button
            onClick={() => setOpenOut(true)}
            disabled={!canClockOut}
            className={`px-4 py-2 rounded-lg border font-medium ${
              canClockOut
                ? "bg-red hover:bg-red-400 hover:text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {actionLoading === "out" ? "Clocking Out..." : "Clock Out"}
          </button>

          <button
            onClick={onRefresh}
            disabled={loadingToday || !!actionLoading}
            className={`ml-auto px-4 py-2 rounded-lg border font-medium ${
              loadingToday || actionLoading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            Refresh
          </button>

          <button
            onClick={onGoDashboard}
            disabled={
              loadingToday || !!actionLoading || !isCheckedIn || isCompleted
            }
            className={`px-4 py-2 rounded-lg border font-medium ${
              loadingToday || actionLoading || !isCheckedIn || isCompleted
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#1dacbc] text-white hover:bg-[#14939e]"
            }`}
          >
            Go to dashboard
          </button>
        </div>

        {/* CONFIRM CLOCK IN */}
        <ConfirmActionDialog
          open={openIn}
          onOpenChange={setOpenIn}
          title="Konfirmasi Clock In"
          description="Apakah kamu yakin ingin memulai shift (Clock In) sekarang?"
          confirmText="Ya, Clock In"
          cancelText="Batal"
          loading={actionLoading === "in"}
          onConfirm={onClockIn}
        />

        {/* CONFIRM CLOCK OUT */}
        <ConfirmActionDialog
          open={openOut}
          onOpenChange={setOpenOut}
          title="Konfirmasi Clock Out"
          description="Apakah kamu yakin ingin mengakhiri shift (Clock Out) sekarang? Setelah Clock Out, kamu akan terkunci sampai besok."
          confirmText="Ya, Clock Out"
          cancelText="Batal"
          loading={actionLoading === "out"}
          onConfirm={onClockOut}
        />

        {isCompleted && (
          <div className="text-l text-gray-600">
            Shift sudah selesai. Akses ke Dashboard akan terkunci sampai besok.
          </div>
        )}

        {dashboardTarget && !isCheckedIn && !isCompleted && (
          <div className="text-sm text-gray-600">
            Setelah clock-in, tombol <b>Go to dashboard</b> akan aktif.
          </div>
        )}
      </div>
    </div>
  );
}