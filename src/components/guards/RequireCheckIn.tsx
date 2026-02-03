"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance } from "@/contexts/AttendanceContext";
import { RoleCode } from "@/types";

type Props = {
  children: React.ReactNode;
  roles?: RoleCode[]; // optional: batasi untuk role tertentu
  redirectTo?: string; // default: "/attendance"
};

export function RequireCheckIn({
  children,
  roles,
  redirectTo = "/attendance",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { isUserCheckedIn } = useAttendance();

  // kalau belum login, kamu bisa redirect ke login (sesuaikan route kamu)
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  /**
   * Default: hanya WORKER & DRIVER yang wajib check-in sebelum masuk dashboard.
   * Kalau `roles` diberikan, maka hanya role-role itu yang wajib check-in.
   */
  const defaultMustCheckIn = user.role === "WORKER" || user.role === "DRIVER";
  const mustCheckIn = roles ? roles.includes(user.role as RoleCode) : defaultMustCheckIn;

  // AttendanceContext pakai outletStaffId (number)
  const outletStaffId = user.outletStaffId;
  const checkedIn = mustCheckIn
    ? outletStaffId
      ? isUserCheckedIn(outletStaffId)
      : false
    : true;

  // kalau belum check-in, paksa ke halaman attendance
  useEffect(() => {
    if (mustCheckIn && !checkedIn && pathname !== redirectTo) {
      router.replace(redirectTo);
    }
  }, [mustCheckIn, checkedIn, pathname, redirectTo, router]);

  if (mustCheckIn && !checkedIn) {
    // optional: render fallback (kalau redirect terasa delay)
    return null;
  }

  return <>{children}</>;
}