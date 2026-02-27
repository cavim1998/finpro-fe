import PaginationSection from "@/components/PaginationSection";

interface PerformanceViewProps {
  data: any;
  meta: any;
  onPageChange: (page: number) => void;
}

export const PerformanceView = ({
  data,
  meta,
  onPageChange,
}: PerformanceViewProps) => {
  const employeeData = Array.isArray(data) ? data : data?.data || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="font-bold text-lg">Employee Performance</h3>
      </div>
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">Nama Pegawai</th>
              <th className="px-6 py-4">Posisi</th>
              <th className="px-6 py-4">Outlet</th>
              <th className="px-6 py-4 text-center">Tugas Cucian</th>
              <th className="px-6 py-4 text-center">Tugas Antar/Jemput</th>
              <th className="px-6 py-4 text-center">Total Pekerjaan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employeeData.map((emp: any, idx: number) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-800">
                  {emp.name}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium border">
                    {emp.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{emp.outletName}</td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium">
                    {emp.stationJobsDone}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-green-50 text-green-600 px-2 py-1 rounded font-medium">
                    {emp.deliveryJobsDone}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-[#17A2B8] text-white px-3 py-1 rounded-md font-bold shadow-sm">
                    {emp.jobsDone}
                  </span>
                </td>
              </tr>
            ))}
            {employeeData.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  Tidak ada data performa pegawai pada periode ini.
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
  );
};
