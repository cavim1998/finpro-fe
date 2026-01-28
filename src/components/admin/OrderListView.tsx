'use client';

import { Search, Filter, Plus, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import OrderCard from '@/components/admin/card/OrderCard';

interface OrderListViewProps {
  title: string;
  isPickupTab: boolean;
  data: any[];  
  page: number;
  totalData: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (newPage: number) => void;
  onCreateOrder: () => void;
}

export const OrderListView = ({ 
  title, isPickupTab, data, page, totalData, startIndex, endIndex, onPageChange, onCreateOrder 
}: OrderListViewProps) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500">Outlet: Cabang Tangerang (ID: 104)</p>
       </div>

       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#17A2B8]" />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 w-full sm:w-auto justify-center">
              <Filter size={18} /> Filter
            </button>
            {isPickupTab && (
               <button onClick={onCreateOrder} className="flex items-center gap-2 px-4 py-2 bg-[#17A2B8] text-white rounded-lg hover:bg-[#138496] shadow-md shadow-[#17A2B8]/20 w-full sm:w-auto justify-center">
                 <Plus size={18} /> Create Order
               </button>
            )}
          </div>
       </div>

       <div className="space-y-4 min-h-75">
          {data.length > 0 ? (
            data.map((item: any) => isPickupTab ? (
                  <div key={item.id} className="bg-white p-5 rounded-xl border-l-4 border-[#17A2B8] shadow-sm">
                    <div className="flex justify-between flex-col sm:flex-row gap-4">
                      <div>
                        <h3 className="font-bold text-gray-800">{item.customer}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={14}/> {item.address}</p>
                      </div>
                      <button onClick={onCreateOrder} className="text-[#17A2B8] font-bold text-sm border border-[#17A2B8] px-4 py-2 rounded-lg hover:bg-[#E0F7FA]">Process Pickup</button>
                    </div>
                  </div>
                ) : <OrderCard key={item.id} order={item} />
            )
          ) : (
            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">Tidak ada data.</div>
          )}
       </div>

       <div className="mt-8 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <span className="text-sm text-gray-500">Showing {startIndex + 1}-{Math.min(endIndex, totalData)} of {totalData}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => onPageChange(page - 1)} className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"><ChevronLeft size={18}/></button>
            <button disabled={endIndex >= totalData} onClick={() => onPageChange(page + 1)} className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"><ChevronRight size={18}/></button>
          </div>
       </div>
    </div>
  );
};