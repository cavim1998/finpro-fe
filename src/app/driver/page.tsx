"use client";

import { RequireCheckIn } from "@/components/guards/RequireCheckIn";
import { DriverDashboard } from "@/components/driver/DriverDashboard";
import { RoleCode } from "@/types";

export default function DriverPage() {
  return (
    <RequireCheckIn roles={["DRIVER" as RoleCode]} redirectTo="/attendance">
      <DriverDashboard />
    </RequireCheckIn>
  );
}