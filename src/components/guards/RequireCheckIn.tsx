"use client";

import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { useProfileQuery } from "@/hooks/api/useProfile";
import { RoleCode } from "@/types";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { getRoleFromToken } from "@/lib/auth";

type Props = {
  children: React.ReactNode;
  roles: RoleCode[];
  redirectTo: string;
};

export default function RequireCheckInRQ({
  children,
  roles,
  redirectTo,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const token = Cookies.get("auth_token");
  const roleFromToken = getRoleFromToken(token ?? undefined) as RoleCode | null;

  const profileQ = useProfileQuery();
  const attendanceQ = useAttendanceTodayQuery();

  const role = (profileQ.data?.role as RoleCode | undefined) ?? roleFromToken ?? undefined;
  const isCheckedIn = !!attendanceQ.data?.isCheckedIn;
  const isLockedToday = !!attendanceQ.data?.isCompleted;

  const profileStatus = (profileQ.error as any)?.response?.status;

const shouldGoSignin = useMemo(() => {
  if (!token) return true;
  if (profileQ.isLoading) return false;
  if (profileQ.isError) return profileStatus === 401;
  if (!role) return true;
  if (!roles.includes(role)) return true;
  return false;
}, [token, profileQ.isLoading, profileQ.isError, profileStatus, role, roles]);

  const shouldGoAttendance = useMemo(() => {
    if (!token) return false;
    if (profileQ.isLoading || attendanceQ.isLoading) return false;
    if (profileQ.isError) return false;
    if (!role || !roles.includes(role)) return false;

    const allowAccess = isCheckedIn && !isLockedToday;
    return !allowAccess;
  }, [
    token,
    profileQ.isLoading,
    attendanceQ.isLoading,
    profileQ.isError,
    role,
    roles,
    isCheckedIn,
    isLockedToday,
  ]);

  useEffect(() => {
    if (shouldGoSignin) {
      router.replace("/signin");
      return;
    }

    if (shouldGoAttendance && pathname !== redirectTo) {
      router.replace(redirectTo);
      return;
    }
  }, [shouldGoSignin, shouldGoAttendance, pathname, redirectTo, router]);

  if (!token) return null;
  if (profileQ.isLoading || attendanceQ.isLoading) return null;
  if (shouldGoSignin) return null;
  if (shouldGoAttendance) return null;

  return <>{children}</>;
}
