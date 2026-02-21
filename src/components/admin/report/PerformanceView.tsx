export const PerformanceView = ({ data }: { data: any[] }) => (
  <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
    <div className="p-6 border-b">
      <h3 className="font-bold text-lg">Employee Performance</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr>
            <th className="px-6 py-4">Nama Pegawai</th>
            <th className="px-6 py-4">Posisi (Role)</th>
            <th className="px-6 py-4">Pekerjaan Selesai</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data?.map((emp, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium">{emp.name}</td>
              <td className="px-6 py-4 text-gray-500">{emp.role}</td>
              <td className="px-6 py-4">
                <span className="bg-[#E0F7FA] text-[#17A2B8] px-2 py-1 rounded-md font-bold">
                  {emp.jobsDone} Pekerjaan
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                  Active
                </span>
              </td>
            </tr>
          ))}
          {(!data || data.length === 0) && (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-400">
                Tidak ada data performa.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
