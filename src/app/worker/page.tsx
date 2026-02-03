"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAttendance } from "@/contexts/AttendanceContext";
import { CheckInGate } from "@/components/attendance/CheckInGate";
import { WorkerDashboard } from "@/components/worker/WorkerDashboard";

export default function WorkerPage() {
  const { user } = useAuth();
  const { isUserCheckedIn } = useAttendance();

  if (!user) return null;

  const checked = isUserCheckedIn(user.id);

  if (!checked) return <CheckInGate />;

  return <WorkerDashboard />;
}