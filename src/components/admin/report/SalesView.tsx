import { TrendingUp, User, DollarSign } from "lucide-react";
import PaginationSection from "@/components/PaginationSection";
interface SalesViewProps {
  data: any;
  meta: any;
  onPageChange: (page: number) => void;
}

export const SalesView = ({ data, meta, onPageChange }: SalesViewProps) => {
  const income = data?.totalIncome || 0;
  const ordersCount = data?.totalOrders || 0;
  const avg = ordersCount > 0 ? income / ordersCount : 0;
  const ordersList = data?.orders || [];

  return (
    <div className="space-y-6">
      {/* --- BAGIAN SUMMARY (3 KOTAK) SAMA SEPERTI SEBELUMNYA --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border flex items-center gap-4 shadow-sm">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <DollarSign />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Income</p>
            <h3 className="text-xl font-bold">
              Rp {income.toLocaleString("id-ID")}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border flex items-center gap-4 shadow-sm">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <TrendingUp />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Orders Selesai</p>
            <h3 className="text-xl font-bold">{ordersCount} Transaksi</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border flex items-center gap-4 shadow-sm">
          <div className="bg-orange-100 p-3 rounded-full text-orange-600">
            <User />
          </div>
          <div>
            <p className="text-sm text-gray-500">Rata-rata per Order</p>
            <h3 className="text-xl font-bold">
              Rp {Math.round(avg).toLocaleString("id-ID")}
            </h3>
          </div>
        </div>
      </div>

      {/* --- BAGIAN TABEL RINCIAN --- */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-bold text-lg text-gray-800">Rincian Transaksi</h3>
        </div>
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">No. Order</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Outlet</th>
                <th className="px-6 py-4">Tanggal Selesai</th>
                <th className="px-6 py-4 text-right">Total (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ordersList.map((order: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-[#17A2B8]">
                    {order.orderNo}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {order.outletName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(order.createdAt).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800 text-right">
                    Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
              {ordersList.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    Tidak ada transaksi pada periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.total > meta.limit && (
          <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50">
            <PaginationSection
              meta={meta}
              onClick={(newPage) => onPageChange(newPage)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
