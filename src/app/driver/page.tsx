"use client";

import { DriverDashboard } from "@/components/driver/DriverDashboard";
import RequireCheckIn from "@/components/guards/RequireCheckIn";

export default function DriverPage() {
  return (
    <RequireCheckIn roles={["DRIVER"]} redirectTo="/attendance?next=/driver">
      <DriverDashboard />
    </RequireCheckIn>
  );
}