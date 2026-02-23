"use client";

import NavbarWorker from "@/components/Navbarworker";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import AttendanceHeader from "./components/AttendanceHeader";
import AttendanceCard from "./components/AttendanceCard";

import {
  useClockInMutation,
  useClockOutMutation,
} from "@/hooks/api/useAttendanceMutations";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { useProfileQuery } from "@/hooks/api/useProfile";

type UserProfile = {
  name?: string;
  fullName?: string;
  email?: string;
  station?: string;
  workerStation?: string;
  outletStaff?: { workerStation?: string };
  staff?: { workerStation?: string };
};

export default function AttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { data: session, status } = useSession();
  const isSessionLoading = status === "loading";
  const isUnauthenticated = status === "unauthenticated";

  useEffect(() => {
    if (isUnauthenticated) {
      router.replace("/signin");
    }
  }, [isUnauthenticated, router]);

  const profileQ = useProfileQuery();
  const attendanceQ = useAttendanceTodayQuery({
    enabled: status === "authenticated",
  });
  const clockInM = useClockInMutation();
  const clockOutM = useClockOutMutation();

  const today = attendanceQ.data;
  const loadingToday = attendanceQ.isLoading;

  const [actionError, setActionError] = useState<string | null>(null);

  const isCheckedIn = !!today?.isCheckedIn;
  const isCompleted = !!today?.isCompleted;

  const actionLoading = clockInM.isPending
    ? "in"
    : clockOutM.isPending
      ? "out"
      : null;

  const role = session?.user?.role || profileQ.data?.role;
  const workerStationRaw =
    session?.user?.station ||
    session?.user?.workerStation ||
    profileQ.data?.station ||
    profileQ.data?.workerStation ||
    profileQ.data?.outletStaff?.workerStation ||
    profileQ.data?.staff?.workerStation ||
    "WASHING";
  const workerStation = String(workerStationRaw).toUpperCase();

  const fallbackNext = useMemo(() => {
    if (role === "DRIVER") return "/driver";
    if (role === "WORKER") {
      if (workerStation.includes("IRONING")) return "/worker/ironing";
      if (workerStation.includes("PACKING")) return "/worker/packing";
      return "/worker/washing";
    }
    if (role === "SUPER_ADMIN" || role === "OUTLET_ADMIN") return "/admin";
    return "/profile";
  }, [role, workerStation]);

  const dashboardTarget = next ?? fallbackNext;

  const greetingName = useMemo(() => {
    const p: UserProfile | null = profileQ.data ?? null;
    return p?.fullName || p?.name || p?.email || "User";
  }, [profileQ.data]);

  const statusText = useMemo(() => {
    if (isCompleted) return "Shift selesai — terkunci sampai besok.";
    if (isCheckedIn) return "Sedang shift.";
    return "Belum Clock-in. Silakan Clock-in untuk memulai shift!";
  }, [isCheckedIn, isCompleted]);

  const canClockIn =
    !loadingToday && !actionLoading && !isCheckedIn && !isCompleted;
  const canClockOut =
    !loadingToday && !actionLoading && isCheckedIn && !isCompleted;

  const handleClockIn = async () => {
    setActionError(null);
    try {
      await clockInM.mutateAsync();
      await attendanceQ.refetch();
    } catch (e: unknown) {
      const message =
        typeof e === "object" &&
        e !== null &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Clock-in gagal.";
      setActionError(message);
    }
  };

  const handleClockOut = async () => {
    setActionError(null);
    try {
      await clockOutM.mutateAsync();
      await attendanceQ.refetch();
    } catch (e: unknown) {
      const message =
        typeof e === "object" &&
        e !== null &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Clock-out gagal.";
      setActionError(message);
    }
  };

  if (isSessionLoading) return null;
  if (isUnauthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <NavbarWorker />

      <AttendanceHeader
        greetingName={greetingName}
        loadingProfile={profileQ.isLoading}
      />

      <AttendanceCard
        today={today}
        loadingToday={loadingToday}
        statusText={statusText}
        isCheckedIn={isCheckedIn}
        isCompleted={isCompleted}
        actionError={actionError}
        actionLoading={actionLoading}
        canClockIn={canClockIn}
        canClockOut={canClockOut}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
        onRefresh={() => attendanceQ.refetch()}
        dashboardTarget={dashboardTarget}
        onGoDashboard={() => router.push(dashboardTarget)}
      />
    </div>
  );
}
