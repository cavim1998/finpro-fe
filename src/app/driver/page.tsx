"use client";

import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import DriverDashboard from "./components/DriverDasboard";
import NavbarWorker from "@/components/Navbarworker";


export default function DriverPage() {
  return (
    <RequireCheckInRQ roles={["DRIVER"]} redirectTo="/attendance?next=/driver">
      <div className="border-b-1">
        <NavbarWorker />
      </div>
      <DriverDashboard />
    </RequireCheckInRQ>
  );
}