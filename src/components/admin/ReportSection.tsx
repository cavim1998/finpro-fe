'use client';

import React, { useState } from 'react';
import { Calendar, Download, TrendingUp, User, DollarSign, Users } from 'lucide-react';

export default function ReportSection() {
  const [reportType, setReportType] = useState<'SALES' | 'PERFORMANCE'>('SALES');

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      
      {/* Header Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setReportType('SALES')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${reportType === 'SALES' ? 'bg-white text-[#17A2B8] shadow-sm' : 'text-gray-500'}`}>Sales Report</button>
          <button onClick={() => setReportType('PERFORMANCE')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${reportType === 'PERFORMANCE' ? 'bg-white text-[#17A2B8] shadow-sm' : 'text-gray-500'}`}>Employee Performance</button>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm"><Calendar size={16} /> Jan 2026</button>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#17A2B8] text-[#17A2B8] rounded-lg hover:bg-[#E0F7FA] text-sm font-medium"><Download size={16} /> Export</button>
        </div>
      </div>

      {/* Content View */}
      {reportType === 'SALES' ? <SalesView /> : <PerformanceView />}
    </div>
  );
}

// --- SUB-COMPONENT: SALES VIEW ---
const SalesView = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Summary Cards */}
    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { title: 'Total Income', val: 'Rp 45.200.000', icon: <DollarSign size={24}/>, color: 'text-green-600', bg: 'bg-green-100' },
        { title: 'Total Orders', val: '1,240 Trans', icon: <TrendingUp size={24}/>, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Avg. per Cust', val: 'Rp 36.500', icon: <User size={24}/>, color: 'text-orange-600', bg: 'bg-orange-100' }
      ].map((c, i) => (
        <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className={`${c.bg} p-3 rounded-full ${c.color}`}>{c.icon}</div>
          <div><p className="text-sm text-gray-500">{c.title}</p><h3 className="text-xl font-bold text-gray-800">{c.val}</h3></div>
        </div>
      ))}
    </div>

    {/* Simple Chart */}
    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h4 className="font-bold text-gray-800 mb-6">Daily Income Analytics</h4>
      <div className="flex items-end gap-2 h-64 w-full">
        {[40, 60, 35, 80, 55, 90, 70, 45, 60, 75, 50, 65].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end group relative">
             <div style={{ height: `${h}%` }} className="bg-[#17A2B8] opacity-80 group-hover:opacity-100 rounded-t-md transition-all"></div>
             <span className="text-xs text-gray-400 text-center mt-2">{i+1}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Top Services */}
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h4 className="font-bold text-gray-800 mb-4">Top Services</h4>
      <div className="space-y-4">
        {[{n:'Cuci Kiloan', v:70, c:'bg-blue-500'}, {n:'Cuci Satuan', v:20, c:'bg-purple-500'}, {n:'Karpet', v:10, c:'bg-orange-500'}].map((item) => (
           <div key={item.n}>
             <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{item.n}</span><span className="font-bold">{item.v}%</span></div>
             <div className="w-full bg-gray-100 rounded-full h-2"><div className={`${item.c} h-2 rounded-full`} style={{width: `${item.v}%`}}></div></div>
           </div>
        ))}
      </div>
    </div>
  </div>
);

// --- SUB-COMPONENT: PERFORMANCE VIEW ---
const PerformanceView = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="p-6 border-b border-gray-100"><h3 className="font-bold text-lg text-gray-800">Employee Performance</h3></div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Jobs Done</th><th className="px-6 py-4">Rating</th><th className="px-6 py-4">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {[
            {name: 'Andi Saputra', role: 'Washing Worker', jobs: 145, rate: 4.8},
            {name: 'Budi Santoso', role: 'Driver', jobs: 89, rate: 4.9},
            {name: 'Siti Aminah', role: 'Ironing Worker', jobs: 132, rate: 4.7},
          ].map((emp, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-800">{emp.name}</td>
              <td className="px-6 py-4 text-gray-500">{emp.role}</td>
              <td className="px-6 py-4"><span className="bg-[#E0F7FA] text-[#17A2B8] px-2 py-1 rounded-md font-bold">{emp.jobs}</span></td>
              <td className="px-6 py-4 text-yellow-500 font-bold">★ {emp.rate}</td>
              <td className="px-6 py-4"><span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">Active</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);