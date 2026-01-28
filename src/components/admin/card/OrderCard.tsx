import React from 'react';
import { FileText, MoreVertical } from 'lucide-react';
import { Order } from '@/types/admin';

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const statusColor = order.status === 'SEDANG_DICUCI' 
    ? 'bg-blue-100 text-blue-700' 
    : 'bg-orange-100 text-orange-700';

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-[#17A2B8] transition-colors group">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-bold text-[#17A2B8] bg-[#E0F7FA] px-2 py-1 rounded-md">{order.id}</span>
          <h3 className="font-bold text-gray-800 mt-2 text-lg">{order.customer}</h3>
          <p className="text-xs text-gray-400">{order.date}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>
      
      <div className="flex gap-4 text-sm text-gray-600 border-t border-gray-50 pt-3">
        <div className="flex items-center gap-1">
          <FileText size={16} className="text-gray-400"/> {order.itemsCount} Items
        </div>
        <div className="flex items-center gap-1">
          <MoreVertical size={16} className="text-gray-400"/> {order.weight} Kg
        </div>
      </div>

      <div className="mt-4 flex gap-2">
          <button className="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Track</button>
          <button className="flex-1 py-2 text-sm bg-[#17A2B8] text-white rounded-lg hover:bg-[#138496]">Detail</button>
      </div>
    </div>
  );
};

export default OrderCard;