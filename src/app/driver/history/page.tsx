"use client";

import { BottomNav } from "@/components/BottomNav";
import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DriverHistoryPage() {
  return (
    <RequireCheckInRQ roles={["DRIVER"]} redirectTo="/attendance?next=/driver/history">
      <NavbarWorker />

      <div className="container mx-auto px-4 py-6 pb-24">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Driver History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Halaman riwayat driver sedang disiapkan.
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNav role="DRIVER" />
    </RequireCheckInRQ>
  );
}
