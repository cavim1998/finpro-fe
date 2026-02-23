"use client";

import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import DriverDashboard from "./components/DriverDasboard";
import NavbarWorker from "@/components/Navbarworker";


export default function DriverPage() {
  return (
    <RequireCheckInRQ roles={["DRIVER"]} redirectTo="/attendance?next=/driver">
      <NavbarWorker />
      <DriverDashboard />
    </RequireCheckInRQ>
  );
}
