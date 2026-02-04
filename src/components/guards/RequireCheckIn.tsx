"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance } from "@/contexts/AttendanceContext";
import { RoleCode } from "@/types";

type Props = {
  children: React.ReactNode;
  roles?: RoleCode[];
  redirectTo?: string;
};

export default function RequireCheckIn({
  children,
  roles,
  redirectTo = "/attendance",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, authReady } = useAuth();
  const { today, loadingToday, refreshToday } = useAttendance();

  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) router.replace("/signin");
  }, [authReady, isAuthenticated, router]);

  // refresh attendance kalau sudah authenticated
  useEffect(() => {
    if (!authReady) return;
    if (isAuthenticated) {
      refreshToday().catch(() => {});
    }
  }, [authReady, isAuthenticated, refreshToday]);

  if (!authReady) return null;
  if (!isAuthenticated || !user) return null;

  const defaultMustCheckIn = user.role === "WORKER" || user.role === "DRIVER";
  const mustCheckIn = roles ? roles.includes(user.role as RoleCode) : defaultMustCheckIn;

  const isLockedToday = !!today?.isCompleted;
  const isCheckedIn = !!today?.isCheckedIn;

  const allowAccess = !mustCheckIn ? true : isCheckedIn && !isLockedToday;

  useEffect(() => {
    if (!mustCheckIn) return;
    if (loadingToday) return;

    if (!allowAccess && pathname !== redirectTo) {
      router.replace(redirectTo);
    }
  }, [mustCheckIn, allowAccess, loadingToday, pathname, redirectTo, router]);

  if (mustCheckIn && (loadingToday || !allowAccess)) return null;

  return <>{children}</>;
}