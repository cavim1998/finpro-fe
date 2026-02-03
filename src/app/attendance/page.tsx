"use client";

import CheckInCheckOut from "@/components/attendance/CheckInCheckOut";
import CheckInCheckOutHariIni from "@/components/attendance/CheckInCheckOutHariIni";

export default function Attendance() {
  return (
    <div className="max-w-7xl mx-auto pt-5 font-sans border">
      <CheckInCheckOutHariIni />

      {/* Check In / Check Out Button */}
      <CheckInCheckOut />

      {/* Rekapitulasi Absensi Button */}
      <div className="m-2">
        <button className="w-full p-4 hover:bg-[#6c757d] hover:text-white rounded-2xl bg-[#adb5bd] font-bold">
          Rekapitulasi Absensi
        </button>
      </div>

      {/* Jadwal Sebulan Kedepan */}
      <div className="m-2">
        <h1 className="font-bold text-xl text-center">
          Jadwal Satu Bulan Kedepan
        </h1>
      </div>
    </div>
  );
}
