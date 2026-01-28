'use client';

import React, { useState } from 'react';
import { Menu, AlertTriangle, LayoutDashboard, Truck, ShoppingBag, FileText, Database } from 'lucide-react';
import { TabType, UserRole } from '@/types/admin';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenBypass: () => void;
  userRole: UserRole;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenBypass, userRole }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navClass = (tab: TabType) => 
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      activeTab === tab 
      ? 'bg-[#E0F7FA] text-[#17A2B8]' 
      : 'text-gray-600 hover:bg-gray-50'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 lg:hidden text-gray-500">
              <Menu size={24} />
            </button>
            <span className="text-xl font-bold text-[#17A2B8]">
              CHINGU <span className="text-xs font-normal text-gray-500 block sm:inline">{userRole.replace('_', ' ')}</span>
            </span>
            
            {/* Desktop Menu (Hidden on Mobile) */}
            <div className="hidden lg:flex items-center ml-8 gap-1">
              <button onClick={() => setActiveTab('DASHBOARD')} className={navClass('DASHBOARD')}>
                <LayoutDashboard size={18}/> Dashboard
              </button>
              
              {/* Menu Umum (Outlet Admin & Super Admin) */}
              <button onClick={() => setActiveTab('PICKUP')} className={navClass('PICKUP')}>
                <Truck size={18}/> Pickup
              </button>
              <button onClick={() => setActiveTab('ORDERS')} className={navClass('ORDERS')}>
                <ShoppingBag size={18}/> Orders
              </button>
              <button onClick={() => setActiveTab('REPORT')} className={navClass('REPORT')}>
                <FileText size={18}/> Reports
              </button>

              {/* Menu Khusus SUPER_ADMIN */}
              {userRole === 'SUPER_ADMIN' && (
                <button onClick={() => setActiveTab('MASTER')} className={navClass('MASTER')}>
                  <Database size={18}/> Master Data
                </button>
              )}
            </div>
          </div>

          {/* Right Section (Notif Bypass & Profile) */}
          <div className="flex items-center gap-4">
            <button onClick={onOpenBypass} className="relative p-2 text-gray-400 hover:text-gray-600">
              <AlertTriangle size={24} />
              {/* Dot merah notifikasi */}
              <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-[#17A2B8] flex items-center justify-center text-white font-bold text-xs">
              {userRole === 'SUPER_ADMIN' ? 'SA' : 'OA'}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-2 space-y-1 shadow-lg">
          <button onClick={() => setActiveTab('DASHBOARD')} className="block w-full text-left py-2 px-3 text-gray-600">Dashboard</button>
          <button onClick={() => setActiveTab('PICKUP')} className="block w-full text-left py-2 px-3 text-gray-600">Pickup</button>
          <button onClick={() => setActiveTab('ORDERS')} className="block w-full text-left py-2 px-3 text-gray-600">Orders</button>
          {userRole === 'SUPER_ADMIN' && (
             <button onClick={() => setActiveTab('MASTER')} className="block w-full text-left py-2 px-3 text-[#17A2B8] font-bold">Master Data</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;