"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Truck,
  ClipboardList,
  Clock,
  User,
  Users,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

type NavItem = {
  path: string;
  icon: React.ElementType;
  label: string;
};

export function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();
    console.log("[BottomNav] pathname:", pathname);
  console.log("[BottomNav] user:", user);
  console.log("[BottomNav] user.role:", user?.role, "type:", typeof user?.role);

  if (!user) return null;

  const getNavItems = (): NavItem[] => {
    switch (user.role) {
      case "DRIVER":
        return [
          { path: "/driver", icon: Home, label: "Home" },
          { path: "/driver/pickups", icon: Truck, label: "Tasks" },
          { path: "/driver/history", icon: Clock, label: "History" },
          { path: "/driver/profile", icon: User, label: "Profile" },
        ];
      case "WORKER":
        return [
          { path: "/worker", icon: Home, label: "Home" },
          { path: "/worker/orders", icon: ClipboardList, label: "Orders" },
          { path: "/worker/history", icon: Clock, label: "History" },
          { path: "/worker/profile", icon: User, label: "Profile" },
        ];
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
  };

  const navItems = getNavItems();
  console.log("[BottomNav] navItems:", navItems);

  const isActivePath = (target: string) =>
    pathname === target || pathname.startsWith(target + "/");

  return (
    
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
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