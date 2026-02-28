import { Download, Loader2 } from "lucide-react";

type ReportFilterType = "SALES" | "PERFORMANCE" | "ATTENDANCE";

type OutletOption = {
  id: number;
  name: string;
};

type ReportFiltersProps = {
  role: string | null;
  type: ReportFilterType;
  setType: (type: ReportFilterType) => void;
  outId?: number;
  setOut: (outletId?: number) => void;
  sDate: string;
  setSDate: (value: string) => void;
  eDate: string;
  setEDate: (value: string) => void;
  outlets?: { data?: OutletOption[] };
  onExport: () => void;
  isExporting?: boolean;
};

export const ReportFilters = ({
  role,
  type,
  setType,
  outId,
  setOut,
  sDate,
  setSDate,
  eDate,
  setEDate,
  outlets,
  onExport,
  isExporting = false,
}: ReportFiltersProps) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col xl:flex-row justify-between gap-4">
    <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
      <button
        onClick={() => setType("SALES")}
        className={`px-4 py-2 text-sm font-medium rounded-md ${type === "SALES" ? "bg-white text-[#17A2B8] shadow-sm" : "text-gray-500"}`}
      >
        Sales Report
      </button>
      <button
        onClick={() => setType("PERFORMANCE")}
        className={`px-4 py-2 text-sm font-medium rounded-md ${type === "PERFORMANCE" ? "bg-white text-[#17A2B8] shadow-sm" : "text-gray-500"}`}
      >
        Employee Performance
      </button>
      <button
        onClick={() => setType("ATTENDANCE")}
        className={`px-4 py-2 text-sm font-medium rounded-md ${type === "ATTENDANCE" ? "bg-white text-[#17A2B8] shadow-sm" : "text-gray-500"}`}
      >
        Attendance
      </button>
    </div>
    <div className="flex flex-wrap gap-2 items-center">
      {role === "SUPER_ADMIN" && (
        <select
          value={outId || ""}
          onChange={(e) => setOut(Number(e.target.value) || undefined)}
          className="border p-2 rounded-lg text-sm outline-none"
        >
          <option value="">Semua Outlet</option>
          {outlets?.data?.map((outlet) => (
            <option key={outlet.id} value={outlet.id}>
              {outlet.name}
            </option>
          ))}
        </select>
      )}
      <input
        type="date"
        value={sDate}
        onChange={(e) => setSDate(e.target.value)}
        className="border p-2 rounded-lg text-sm outline-none"
      />
      <span className="text-gray-400">-</span>
      <input
        type="date"
        value={eDate}
        onChange={(e) => setEDate(e.target.value)}
        className="border p-2 rounded-lg text-sm outline-none"
      />
      <button
        onClick={onExport}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 border border-[#17A2B8] text-[#17A2B8] rounded-lg text-sm hover:bg-[#17A2B8] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        {isExporting ? "Mengekspor..." : "Export Excel"}
      </button>
    </div>
  </div>
);
