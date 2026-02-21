import { TrendingUp, User, DollarSign } from "lucide-react";

export const SalesView = ({ data }: { data: any }) => {
  const income = data?.totalIncome || 0;
  const orders = data?.totalOrders || 0;
  const avg = orders > 0 ? income / orders : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-xl border flex items-center gap-4">
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
      <div className="bg-white p-5 rounded-xl border flex items-center gap-4">
        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
          <TrendingUp />
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Orders Selesai</p>
          <h3 className="text-xl font-bold">{orders} Transaksi</h3>
        </div>
      </div>
      <div className="bg-white p-5 rounded-xl border flex items-center gap-4">
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
  );
};
