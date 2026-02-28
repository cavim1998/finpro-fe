"use client";

import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/admin/Navbar";
import { useAdminAuth } from "@/app/admin/hooks/useAdminAuth";
import AttendanceHistoryDetailView from "@/components/admin/report/AttendanceHistoryDetailView";

export default function AdminAttendanceDetailPage() {
  const params = useParams<{ outletStaffId: string }>();
  const router = useRouter();
  const auth = useAdminAuth();
  const outletStaffId = Number(params?.outletStaffId ?? 0);

  if (auth.isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memuat data pengguna...
      </div>
    );
  }

  if (!auth.roleCode) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-16 font-sans">
      <Navbar
        activeTab="REPORT"
        setActiveTab={(tab) => router.push(`/admin?tab=${tab}`)}
        roleCode={auth.roleCode}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AttendanceHistoryDetailView outletStaffId={outletStaffId} />
      </main>
    </div>
  );
}
