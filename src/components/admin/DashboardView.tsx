import {
  Users,
  ShoppingBag,
  Truck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  DollarSign,
} from "lucide-react";

interface DashboardViewProps {
  roleCode: string;
  onNavigate: (
    tab: "ORDERS" | "PICKUP" | "BYPASS" | "REPORT" | "MASTER",
  ) => void;
  onProcessPickup: () => void;
  onProcessBypass: () => void;
  stats?: {
    totalOrders: number;
    activePickups: number;
    pendingBypass: number;
    todayRevenue: number;
    newCustomers: number;
    outletPerformance: number;
  };
}

export default function DashboardView({
  roleCode,
  onNavigate,
  onProcessPickup,
  onProcessBypass,
  stats,
}: DashboardViewProps) {
  const dashboardStats = stats || {
    totalOrders: 0,
    activePickups: 0,
    pendingBypass: 0,
    todayRevenue: 0,
    newCustomers: 0,
    outletPerformance: 0,
  };

  const menuItems = [
    {
      title: "Order Masuk",
      count: dashboardStats.totalOrders,
      icon: <ShoppingBag size={24} className="text-blue-600" />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      desc: "Pesanan aktif perlu diproses",
      action: () => onNavigate("ORDERS"),
      btnText: "Kelola Order",
    },
    {
      title: "Jemputan (Pickup)",
      count: dashboardStats.activePickups,
      icon: <Truck size={24} className="text-orange-600" />,
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      desc: "Permintaan jemput pelanggan",
      action: () => {
        onNavigate("PICKUP");
        if (onProcessPickup) onProcessPickup();
      },
      btnText: "Lihat Pickup",
    },
    {
      title: "Bypass Request",
      count: dashboardStats.pendingBypass,
      icon: <AlertTriangle size={24} className="text-red-600" />,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      desc: "Masalah selisih stok di stasiun",
      action: () => {
        onNavigate("BYPASS");
        if (onProcessBypass) onProcessBypass();
      },
      btnText: "Review Masalah",
      alert: dashboardStats.pendingBypass > 0,
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER WELCOME */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Selamat Datang,{" "}
          {roleCode === "SUPER_ADMIN" ? "Super Admin" : "Outlet Manager"} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Berikut adalah ringkasan operasional laundry hari ini.
        </p>
      </div>

      {/* STATS CARDS (RINGKASAN) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-full text-green-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Omset Hari Ini</p>
            <h3 className="text-2xl font-bold text-gray-800">
              Rp {dashboardStats.todayRevenue.toLocaleString("id-ID")}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-full text-purple-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Performa Outlet</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {dashboardStats.outletPerformance}%
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pelanggan Baru</p>
            <h3 className="text-2xl font-bold text-gray-800">
              +{dashboardStats.newCustomers}
            </h3>
          </div>
        </div>
      </div>

      {/* ACTION GRID (MENU UTAMA) */}
      <h2 className="text-lg font-bold text-gray-800 mb-4">Menu Cepat</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`bg-white p-6 rounded-xl shadow-sm border transition-all hover:shadow-md group relative overflow-hidden ${item.alert ? "border-red-200 ring-1 ring-red-100" : "border-gray-100 hover:border-blue-200"}`}
          >
            {item.alert && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                PERLU TINDAKAN
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${item.bgColor}`}>
                {item.icon}
              </div>
              <span className={`text-3xl font-bold ${item.textColor}`}>
                {item.count}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500 mb-6 h-10">{item.desc}</p>

            <button
              onClick={item.action}
              className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-between group-hover:text-blue-600"
            >
              {item.btnText}
              <ArrowRight
                size={16}
                className="text-gray-400 group-hover:translate-x-1 transition-transform group-hover:text-blue-600"
              />
            </button>
          </div>
        ))}
      </div>

      {/* AKSES MASTER DATA (KHUSUS SUPER ADMIN) */}
      {roleCode === "SUPER_ADMIN" && (
        <div className="mt-8 bg-linear-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white flex flex-col md:flex-row justify-between items-center shadow-lg">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold">Master Data Management</h3>
            <p className="text-gray-400 text-sm">
              Kelola data outlet, karyawan, harga layanan, dan shift kerja.
            </p>
          </div>
          <button
            onClick={() => onNavigate("MASTER")}
            className="px-6 py-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
          >
            Buka Master Data
          </button>
        </div>
      )}
    </div>
  );
}
