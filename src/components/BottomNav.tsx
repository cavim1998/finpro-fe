"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMe } from "@/features/auth/useMe";
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
};

function getNavItems(role: RoleCode, opts?: GetNavItemsOptions): NavItem[] {
  switch (role) {
    case "DRIVER":
      return [
        { path: "/driver", icon: Home, label: "Home" },
        { path: "/driver/pickups", icon: Truck, label: "Tasks" },
        { path: "/driver/history", icon: Clock, label: "History" },
        { path: "/driver/attendance-history", icon: CalendarDays, label: "Attendance" },
        { path: "/profile", icon: User, label: "Profile" },
      ];

    case "WORKER": {
      const base = opts?.workerHomePath ?? "/worker";
      return [
        { path: base, icon: Home, label: "Home" },
        { path: `${base}/orders`, icon: ClipboardList, label: "Orders" },
        { path: `${base}/history`, icon: Clock, label: "History" },
        { path: `${base}/attendance-history`, icon: CalendarDays, label: "Attendance" },
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
  const effectiveRole = role ?? (meQ.data?.role as RoleCode | undefined);

  if (!effectiveRole) return null;

  const navItems = getNavItems(effectiveRole, { workerHomePath });

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
