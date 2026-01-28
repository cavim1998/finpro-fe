'use client';

import React from 'react';
import { TrendingUp, ShoppingBag, Truck, AlertOctagon } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    {
      label: "Total Omzet (Hari Ini)",
      value: "Rp 1.250.000",
      icon: <TrendingUp size={24} className="text-white" />,
      bg: "bg-gradient-to-r from-[#17A2B8] to-[#20c997]",
      desc: "+12% dari kemarin"
    },
    {
      label: "Pickup Menunggu",
      value: "3 Request",
      icon: <Truck size={24} className="text-blue-600" />,
      bg: "bg-white border border-blue-100",
      textColor: "text-gray-800",
      iconBg: "bg-blue-100",
      desc: "Butuh driver segera"
    },
    {
      label: "Order Aktif",
      value: "12 Cucian",
      icon: <ShoppingBag size={24} className="text-orange-600" />,
      bg: "bg-white border border-orange-100",
      textColor: "text-gray-800",
      iconBg: "bg-orange-100",
      desc: "8 Cuci, 4 Setrika"
    },
    {
      label: "Bypass Request",
      value: "1 Alert",
      icon: <AlertOctagon size={24} className="text-red-600" />,
      bg: "bg-white border border-red-100",
      textColor: "text-red-600",
      iconBg: "bg-red-100",
      desc: "Perlu persetujuan admin"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className={`p-5 rounded-xl shadow-sm ${stat.bg} flex flex-col justify-between h-32`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-xs font-medium mb-1 ${idx === 0 ? 'text-blue-50' : 'text-gray-500'}`}>
                {stat.label}
              </p>
              <h3 className={`text-2xl font-bold ${stat.textColor || 'text-white'}`}>
                {stat.value}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${stat.iconBg || 'bg-white/20'}`}>
              {stat.icon}
            </div>
          </div>
          <p className={`text-xs mt-2 ${idx === 0 ? 'text-blue-50' : 'text-gray-400'}`}>
            {stat.desc}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsSection;