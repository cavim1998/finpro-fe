"use client";

import { RoleCode } from "@/types";
import { ShoppingBag, Truck, Clock } from "lucide-react";
import StatsSection from "./StatsSection";

interface DashboardViewProps {
  roleCode: RoleCode;
  onNavigate: (tab: string) => void;
  onProcessPickup: () => void;
  recentOrders?: any[];
  recentPickups?: any[];
}

export const DashboardView = ({
  roleCode,
  onNavigate,
  onProcessPickup,
  recentOrders = [],
  recentPickups = [],
}: DashboardViewProps) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Selamat Datang,{" "}
          {roleCode === "SUPER_ADMIN" ? "Super Admin" : "Outlet Admin"} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here is what's happening with your store today.
        </p>
      </div>

      <StatsSection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Truck size={18} className="text-[#17A2B8]" /> Incoming Pickups
            </h3>
            <button
              onClick={() => onNavigate("PICKUP")}
              className="text-sm text-gray-500 hover:text-[#17A2B8] hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-3">
            {recentPickups.length > 0 ? (
              recentPickups.slice(0, 3).map((pickup) => (
                <div
                  key={pickup.id}
                  className="p-3 bg-blue-50/50 rounded-lg flex justify-between items-center border border-blue-100"
                >
                  <div>
                    <p className="font-bold text-sm text-gray-800">
                      {pickup.customer?.profile?.fullName ||
                        pickup.customer ||
                        "Pelanggan"}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock size={12} />{" "}
                      {new Date(
                        pickup.createdAt || Date.now(),
                      ).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={onProcessPickup}
                    className="text-xs bg-[#17A2B8] text-white px-3 py-1.5 rounded-lg hover:bg-[#138496] font-semibold transition-colors shadow-sm"
                  >
                    Process
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-sm">Tidak ada pickup baru.</p>
              </div>
            )}
          </div>
        </div>

        {/* 4. WIDGET: Recent Orders (Sedang Dicuci) */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBag size={18} className="text-orange-500" /> Active
              Orders
            </h3>
            <button
              onClick={() => onNavigate("ORDERS")}
              className="text-sm text-gray-500 hover:text-orange-500 hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="p-3 border border-gray-100 rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-bold text-sm text-gray-800">
                      {order.customer?.profile?.fullName || "Pelanggan"}
                    </p>
                    <span className="text-[10px] font-bold tracking-wide uppercase bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100 mt-1 inline-block">
                      {order.status?.replace(/_/g, " ") || "PROCESSING"}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                      {order.orderNo}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-sm">Belum ada order aktif.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
