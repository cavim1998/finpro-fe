"use client";

import { useEffect, useMemo, useState } from "react";
import { useAttendance } from "@/contexts/AttendanceContext";
import { axiosInstance } from "@/lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type UserProfile = {
  name?: string;
  fullName?: string;
  email?: string;
};

function formatTime(d?: Date | string | null) {
  if (!d) return "-";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(d?: Date | string | null) {
  if (!d) return "-";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function AttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { today, loadingToday, refreshToday, clockIn, clockOut } =
    useAttendance();

  const { user } = useAuth();

  const fallbackNext = useMemo(() => {
    const role = user?.role;
    if (role === "DRIVER") return "/driver";
    if (role === "WORKER") return "/worker";
    if (role === "SUPER_ADMIN" || role === "OUTLET_ADMIN") return "/admin";
    return "/profile";
  }, [user]);

  const dashboardTarget = next ?? fallbackNext;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [actionLoading, setActionLoading] = useState<"in" | "out" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isCheckedIn = !!today?.isCheckedIn;
  const isCompleted = !!today?.isCompleted;

  const greetingName = useMemo(() => {
    return profile?.fullName || profile?.name || profile?.email || "User";
  }, [profile]);

  const statusText = useMemo(() => {
    if (isCompleted) return "Shift selesai — terkunci sampai besok.";
    if (isCheckedIn) return "Sedang shift.";
    return "Belum clock-in. Silakan clock-in untuk memulai shift.";
  }, [isCheckedIn, isCompleted]);

  const canClockIn =
    !loadingToday && !actionLoading && !isCheckedIn && !isCompleted;
  const canClockOut =
    !loadingToday && !actionLoading && isCheckedIn && !isCompleted;

  useEffect(() => {
    // refresh status attendance
    refreshToday().catch(() => {});
  }, [refreshToday]);

  useEffect(() => {
    // fetch profile (C2)
    const run = async () => {
      setLoadingProfile(true);
      try {
        const res = await axiosInstance.get("/users/profile");
        const data = res.data?.data ?? res.data;
        setProfile(data);
      } catch {
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };
    run();
  }, []);

  const handleClockIn = async () => {
    setActionError(null);
    setActionLoading("in");
    try {
      await clockIn();
    } catch (e: any) {
      setActionError(e?.response?.data?.message ?? "Clock-in gagal.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleClockOut = async () => {
    setActionError(null);
    setActionLoading("out");
    try {
      await clockOut();
    } catch (e: any) {
      setActionError(e?.response?.data?.message ?? "Clock-out gagal.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <p className="text-sm text-gray-600">
          {loadingProfile ? "Memuat profil..." : `Halo, ${greetingName}`}
        </p>
      </div>

      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tanggal</p>
            <p className="font-medium">{formatDate(today?.date ?? null)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Status</p>
            <p
              className={`font-medium ${isCompleted ? "text-red-600" : isCheckedIn ? "text-green-700" : ""}`}
            >
              {loadingToday ? "Memuat..." : statusText}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm text-gray-600">Clock In</p>
            <p className="font-medium">
              {formatTime(today?.log?.clockInAt ?? null)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm text-gray-600">Clock Out</p>
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
            onClick={handleClockIn}
            disabled={!canClockIn}
            className={`px-4 py-2 rounded-lg border font-medium ${
              canClockIn
                ? "bg-white hover:bg-gray-50"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {actionLoading === "in" ? "Clocking In..." : "Clock In"}
          </button>

          <button
            onClick={handleClockOut}
            disabled={!canClockOut}
            className={`px-4 py-2 rounded-lg border font-medium ${
              canClockOut
                ? "bg-white hover:bg-gray-50"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {actionLoading === "out" ? "Clocking Out..." : "Clock Out"}
          </button>

          <button
            onClick={() => refreshToday()}
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
            onClick={() => router.push(dashboardTarget)}
            disabled={
              loadingToday || !!actionLoading || !isCheckedIn || isCompleted
            }
            className={`px-4 py-2 rounded-lg border font-medium ${
              loadingToday || actionLoading || !isCheckedIn || isCompleted
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            Go to dashboard
          </button>
        </div>
        {next && !isCheckedIn && !isCompleted && (
          <div className="text-sm text-gray-600">
            Setelah clock-in, tombol <b>Go to dashboard</b> akan aktif.
          </div>
        )}

        {next && isCompleted && (
          <div className="text-sm text-gray-600">
            Shift sudah selesai. Dashboard terkunci sampai besok.
          </div>
        )}
        {/* Opsi 2: tombol tetap tampil tapi disabled + pesan */}
        {isCompleted && (
          <div className="text-sm text-gray-600">
            Shift hari ini sudah selesai. Kamu bisa mulai lagi besok.
          </div>
        )}
      </div>
    </div>
  );
}
