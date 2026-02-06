"use client";

import { Users, Store, Shirt, Clock } from "lucide-react";

export type SubTab = "USERS" | "OUTLETS" | "ITEMS" | "SHIFTS";

interface MasterDataNavProps {
  activeTab: SubTab;
  onTabChange: (tab: SubTab) => void;
}

export const MasterDataNav = ({
  activeTab,
  onTabChange,
}: MasterDataNavProps) => {
  const navItems = [
    {
      id: "USERS",
      label: "Pegawai",
      icon: <Users size={18} />,
    },
    {
      id: "OUTLETS",
      label: "Outlet",
      icon: <Store size={18} />,
    },
    {
      id: "ITEMS",
      label: "Item Laundry",
      icon: <Shirt size={18} />,
    },
    {
      id: "SHIFTS",
      label: "Master Shift",
      icon: <Clock size={18} />,
    },
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as SubTab)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200
              ${
                isActive
                  ? "bg-[#17A2B8] text-white shadow-lg shadow-[#17A2B8]/20 -translate-y-px"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 hover:border-gray-200 shadow-sm"
              }
            `}
          >
            <span className={isActive ? "text-white" : "text-gray-400"}>
              {item.icon}
            </span>
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
