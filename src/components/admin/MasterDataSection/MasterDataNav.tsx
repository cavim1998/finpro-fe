import { Users, Store, Shirt } from "lucide-react";

export type SubTab = "USERS" | "OUTLETS" | "ITEMS";

interface MasterDataNavProps {
  activeTab: SubTab;
  onTabChange: (tab: SubTab) => void;
}

export const MasterDataNav = ({
  activeTab,
  onTabChange,
}: MasterDataNavProps) => {
  const navItems = [
    { id: "USERS", label: "Employees", icon: <Users size={16} /> },
    { id: "OUTLETS", label: "Outlets", icon: <Store size={16} /> },
    { id: "ITEMS", label: "Items", icon: <Shirt size={16} /> },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
      <h2 className="text-xl font-bold text-gray-800">
        Master Data Management
      </h2>
      <div className="flex bg-gray-100 p-1 rounded-lg">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as SubTab)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === item.id
                ? "bg-white text-[#17A2B8] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
