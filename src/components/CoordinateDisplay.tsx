import { MapPin } from "lucide-react";

interface CoordinateDisplayProps {
  label: string;
  value: number | undefined;
}

export const CoordinateDisplay = ({ label, value }: CoordinateDisplayProps) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        {label}
      </label>
      <div className="relative">
        <MapPin size={14} className="absolute left-3 top-3 text-gray-400" />
        <input
          readOnly
          value={value || ""}
          className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 focus:outline-none"
          placeholder="-"
        />
      </div>
    </div>
  );
};
