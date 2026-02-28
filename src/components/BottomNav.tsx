"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMe } from "@/features/auth/useMe";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { useProfileQuery } from "@/hooks/api/useProfile";
import {
  Home,
  Truck,
  ClipboardList,
  Clock,
  CalendarDays,
  User,
  Users,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import type { RoleCode } from "@/types/auth";

type NavItem = {
  path: string;
  icon: React.ElementType;
  label: string;
};

type GetNavItemsOptions = {
  /**
   * Kalau worker punya dashboard per-station (mis. /worker/washing),
   * home path bisa di-override dari page.
   */
  workerHomePath?: string;
  workerDashboardPath?: string;
  workerOrdersPath?: string;
  workerHistoryPath?: string;
  workerAttendancePath?: string;
  driverHomePath?: string;
  driverTasksPath?: string;
  driverHistoryPath?: string;
  driverAttendancePath?: string;
};

function getNavItems(role: RoleCode, opts?: GetNavItemsOptions): NavItem[] {
  switch (role) {
    case "DRIVER":
      {
        const homePath = opts?.driverHomePath ?? "/driver";
        const tasksPath = opts?.driverTasksPath ?? "/driver/pickups";
        const historyPath = opts?.driverHistoryPath ?? "/driver/history";
        const attendancePath = opts?.driverAttendancePath ?? "/driver/attendance-history";
      return [
        { path: homePath, icon: Home, label: "Home" },
        { path: tasksPath, icon: Truck, label: "Tasks" },
        { path: historyPath, icon: Clock, label: "History" },
        { path: attendancePath, icon: CalendarDays, label: "Attendance" },
        { path: "/profile", icon: User, label: "Profile" },
      ];
      }

    case "WORKER": {
      const base = opts?.workerHomePath ?? "/worker";
      const dashboardPath = opts?.workerDashboardPath ?? base;
      const ordersPath = opts?.workerOrdersPath ?? `${base}/orders`;
      const historyPath = opts?.workerHistoryPath ?? "/worker/history";
      const attendancePath = opts?.workerAttendancePath ?? `${base}/attendance-history`;
      return [
        { path: dashboardPath, icon: Home, label: "Home" },
        { path: ordersPath, icon: ClipboardList, label: "Orders" },
        { path: historyPath, icon: Clock, label: "History" },
        { path: attendancePath, icon: CalendarDays, label: "Attendance" },
        { path: "/profile", icon: User, label: "Profile" },
      ];
    }

    case "OUTLET_ADMIN":
      return [
        { path: "/admin", icon: Home, label: "Home" },
        { path: "/admin/staff", icon: Users, label: "Staff" },
        { path: "/admin/bypass", icon: AlertTriangle, label: "Bypass" },
        { path: "/admin/reports", icon: BarChart3, label: "Reports" },
      ];

    default:
      return [
        { path: "/customer", icon: Home, label: "Home" },
        { path: "/customer/orders", icon: ClipboardList, label: "Orders" },
        { path: "/customer/profile", icon: User, label: "Profile" },
      ];
  }
}

type BottomNavProps = {
  /** Kalau kamu sudah tahu role dari page, isi ini supaya BottomNav gak perlu query /me */
  role?: RoleCode;
  /** khusus worker: base path home, mis. /worker/washing */
  workerHomePath?: string;
};

export function BottomNav({ role, workerHomePath }: BottomNavProps) {
  const pathname = usePathname();

  const meQ = useMe();
  const profileQ = useProfileQuery();
  const effectiveRole = role ?? (meQ.data?.role as RoleCode | undefined);
  const attendanceTodayQ = useAttendanceTodayQuery({
    enabled: effectiveRole === "WORKER",
  });
  const workerOutletId = Number(
    attendanceTodayQ.data?.outletId ??
      profileQ.data?.outletId ??
      profileQ.data?.outletStaff?.outletId ??
      profileQ.data?.staff?.outletId ??
      meQ.data?.outletId ??
      meQ.data?.outletStaff?.outletId ??
      meQ.data?.staff?.outletId ??
      0,
  );
  const workerOutletStaffId = Number(
    attendanceTodayQ.data?.outletStaffId ??
      profileQ.data?.outletStaffId ??
      profileQ.data?.outletStaff?.id ??
      profileQ.data?.staff?.id ??
      meQ.data?.outletStaffId ??
      meQ.data?.outletStaff?.id ??
      meQ.data?.staff?.id ??
      0,
  );
  const workerHistoryPath =
    Number.isFinite(workerOutletStaffId) && workerOutletStaffId > 0
      ? workerHomePath
        ? `${workerHomePath}/history/${workerOutletStaffId}`
        : `/worker/history/${workerOutletStaffId}`
      : "/worker/history";
  const workerDashboardPath =
    Number.isFinite(workerOutletStaffId) && workerOutletStaffId > 0
      ? workerHomePath
        ? `${workerHomePath}/${workerOutletStaffId}`
        : `/worker/${workerOutletStaffId}`
      : workerHomePath ?? "/worker";
  const workerOrdersPath =
    Number.isFinite(workerOutletId) && workerOutletId > 0
      ? workerHomePath
        ? `${workerHomePath}/orders/${workerOutletId}`
        : `/worker/orders/${workerOutletId}`
      : workerHomePath
        ? `${workerHomePath}/orders`
        : "/worker/orders";
  const workerAttendancePath =
    Number.isFinite(workerOutletStaffId) && workerOutletStaffId > 0
      ? workerHomePath
        ? `${workerHomePath}/attendance-history/${workerOutletStaffId}`
        : `/worker/attendance-history/${workerOutletStaffId}`
      : workerHomePath
        ? `${workerHomePath}/attendance-history`
      : "/worker/attendance-history";
  const driverHomePath =
    Number.isFinite(workerOutletStaffId) && workerOutletStaffId > 0
      ? `/driver/${workerOutletStaffId}`
      : "/driver";
  const driverTasksPath =
    Number.isFinite(workerOutletId) && workerOutletId > 0
      ? `/driver/pickups/${workerOutletId}`
      : "/driver/pickups";
  const driverHistoryPath =
    Number.isFinite(workerOutletStaffId) && workerOutletStaffId > 0
      ? `/driver/history/${workerOutletStaffId}`
      : "/driver/history";
  const driverAttendancePath =
    Number.isFinite(workerOutletStaffId) && workerOutletStaffId > 0
      ? `/driver/attendance-history/${workerOutletStaffId}`
      : "/driver/attendance-history";

  if (!effectiveRole) return null;

  const navItems = getNavItems(effectiveRole, {
    workerHomePath,
    workerDashboardPath,
    workerOrdersPath,
    workerHistoryPath,
    workerAttendancePath,
    driverHomePath,
    driverTasksPath,
    driverHistoryPath,
    driverAttendancePath,
  });

  const isActivePath = (target: string) =>
    pathname === target || pathname.startsWith(target + "/");

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-bottom">
      <div className="flex items-center h-16 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex-1 flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-lg transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "font-semibold" : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
