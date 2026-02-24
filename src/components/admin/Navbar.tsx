"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  AlertTriangle,
  LayoutDashboard,
  Truck,
  ShoppingBag,
  FileText,
  Database,
} from "lucide-react";
import { TabType, RoleCode } from "@/types";
import { useSession, signOut } from "next-auth/react";

interface UserData {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
  image?: string | null;
}

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  roleCode: RoleCode;
}

const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  roleCode,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";
  const userData: UserData | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email || "",
        profileImage: session.user.profileImage || session.user.image || null,
        image: session.user.image || session.user.profileImage || null,
      }
    : null;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  // Generate avatar from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navClass = (tab: TabType) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      activeTab === tab
        ? "bg-[#E0F7FA] text-[#17A2B8]"
        : "text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 lg:hidden text-gray-500"
            >
              <Menu size={24} />
            </button>
            <span className="text-xl font-bold text-[#17A2B8]">
              LAUNDRYQ{" "}
              <span className="text-xs font-normal text-gray-500 block sm:inline">
                {roleCode.replace("_", " ")}
              </span>
            </span>

            {/* Desktop Menu (Hidden on Mobile) */}
            <div className="hidden lg:flex items-center ml-8 gap-1">
              <button
                onClick={() => setActiveTab("DASHBOARD")}
                className={navClass("DASHBOARD")}
              >
                <LayoutDashboard size={18} /> Dashboard
              </button>

              <button
                onClick={() => setActiveTab("PICKUP")}
                className={navClass("PICKUP")}
              >
                <Truck size={18} /> Pickup
              </button>
              <button
                onClick={() => setActiveTab("ORDERS")}
                className={navClass("ORDERS")}
              >
                <ShoppingBag size={18} /> Orders
              </button>
              <button
                onClick={() => setActiveTab("REPORT")}
                className={navClass("REPORT")}
              >
                <FileText size={18} /> Reports
              </button>

              {roleCode === "SUPER_ADMIN" && (
                <button
                  onClick={() => setActiveTab("MASTER")}
                  className={navClass("MASTER")}
                >
                  <Database size={18} /> Master Data
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                  className="w-12 h-12 rounded-full bg-[#1dacbc] text-white font-semibold flex items-center justify-center hover:bg-[#14939e] transition overflow-hidden border-2 border-[#1dacbc]"
                >
                  {userData?.profileImage ? (
                    <img
                      src={userData.profileImage}
                      alt={userData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm">
                      {getInitials(userData?.name || roleCode === "SUPER_ADMIN" ? "SA" : "OA")}
                    </span>
                  )}
                </button>

                {isMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-3 w-56 bg-white border border-[#e6f4f6] rounded-xl shadow-[0_10px_30px_rgba(13,148,136,0.18)] overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 bg-[#f2fbfb] border-b border-[#e6f4f6]">
                      <p className="text-base font-semibold text-[#0f766e] truncate">
                        {userData?.name || "Admin"}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {userData?.email || ""}
                      </p>
                    </div>

                    <div className="py-2">
                      <a
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#f2fbfb]"
                      >
                        Profile
                      </a>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-[#ef4444] hover:bg-[#fff1f2]"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-2 space-y-1 shadow-lg">
          <button
            onClick={() => setActiveTab("DASHBOARD")}
            className="block w-full text-left py-2 px-3 text-gray-600"
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("PICKUP")}
            className="block w-full text-left py-2 px-3 text-gray-600"
          >
            Pickup
          </button>
          <button
            onClick={() => setActiveTab("ORDERS")}
            className="block w-full text-left py-2 px-3 text-gray-600"
          >
            Orders
          </button>
          {roleCode === "SUPER_ADMIN" && (
            <button
              onClick={() => setActiveTab("MASTER")}
              className="block w-full text-left py-2 px-3 text-[#17A2B8] font-bold"
            >
              Master Data
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
