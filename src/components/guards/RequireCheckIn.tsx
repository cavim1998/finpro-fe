"use client";

import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { RoleCode } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";

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
  const { data: session, status } = useSession();

  const role = (session?.user?.role || session?.user?.roleCode) as RoleCode | undefined;
  
  const attendanceQ = useAttendanceTodayQuery();

  const isCheckedIn = !!attendanceQ.data?.isCheckedIn;
  const isLockedToday = !!attendanceQ.data?.isCompleted;

  const shouldGoSignin = useMemo(() => {
    if (status === "loading") return false;
    if (status === "unauthenticated") return true;
    if (!role) return true;
    if (!roles.includes(role)) return true;
    return false;
  }, [status, role, roles]);

  const shouldGoAttendance = useMemo(() => {
    if (status !== "authenticated") return false;
    if (attendanceQ.isLoading) return false;
    if (!role || !roles.includes(role)) return false;

    const allowAccess = isCheckedIn && !isLockedToday;
    return !allowAccess;
  }, [status, attendanceQ.isLoading, role, roles, isCheckedIn, isLockedToday]);

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

  if (status === "loading") return null;
  if (attendanceQ.isLoading) return null;
  if (shouldGoSignin) return null;
  if (shouldGoAttendance) return null;

  return <>{children}</>;
}
