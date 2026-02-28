"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import RequireCheckInRQ from "@/components/guards/RequireCheckIn";
import NavbarWorker from "@/components/Navbarworker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAttendanceTodayQuery } from "@/hooks/api/useAttendanceToday";
import { useDriverDashboard } from "@/features/driver/useDriverDashboard";
import { useDebounce } from "@/hooks/use-debunce";
import { Loader2, Search } from "lucide-react";
import DriverPickupRequestCard from "@/app/driver/components/DriverPickupRequestCard";

function formatDateInput(value?: string | Date | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getObj(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

export default function DriverOutletPickupsPage() {
  const params = useParams<{ outletId: string }>();
  const router = useRouter();
  const fetchLimit = 50;
  const pageSize = 5;
  const taskPage = 1;
  const [pickupPage, setPickupPage] = useState(1);
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput.trim().toLowerCase(), 400);

  const attendanceQ = useAttendanceTodayQuery();
  const isAllowed = !!attendanceQ.data?.isCheckedIn && !attendanceQ.data?.isCompleted;
  const ownOutletId = Number(attendanceQ.data?.outletId ?? 0);
  const routeOutletId = Number(params?.outletId ?? 0);

  useEffect(() => {
    if (!Number.isFinite(ownOutletId) || ownOutletId <= 0) return;
    if (routeOutletId === ownOutletId) return;

    router.replace(`/driver/pickups/${ownOutletId}`);
  }, [ownOutletId, routeOutletId, router]);

  const dashboardQ = useDriverDashboard({ pageSize: fetchLimit, taskPage, pickupPage: 1 });

  const filteredItems = useMemo(() => {
    const items = dashboardQ.data?.pickupRequests?.items ?? [];

    return items.filter((item) => {
      const record = getObj(item);
      const pickupId = String(record.id ?? record.pickupId ?? record.pickup_id ?? "");
      const orderId = String(record.orderId ?? record.order_id ?? "");
      const createdAt = formatDateInput((record.createdAt as string | undefined) ?? undefined);

      const matchesSearch =
        !search ||
        pickupId.toLowerCase().includes(search) ||
        orderId.toLowerCase().includes(search);
      const matchesStart = !startDate || (createdAt && createdAt >= startDate);
      const matchesEnd = !endDate || (createdAt && createdAt <= endDate);

      return matchesSearch && matchesStart && matchesEnd;
    });
  }, [dashboardQ.data?.pickupRequests?.items, endDate, search, startDate]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(pickupPage, totalPages);
  const pageItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const hasNextPage = currentPage < totalPages;
  const theme = {
    textClass: "text-[#1DACBC]",
    borderClass: "border-[#1DACBC]/30",
    hoverShadowClass: "hover:shadow-[0_16px_36px_rgba(29,172,188,0.14)]",
    softBgClass: "bg-[#1DACBC]/5",
    solidButtonClass: "bg-[#1DACBC]/10 text-[#138A96] hover:bg-[#1DACBC]/15",
    ghostButtonClass: "border-[#1DACBC]/30 text-[#1DACBC] hover:bg-[#1DACBC]/5",
  };

  return (
    <RequireCheckInRQ roles={["DRIVER"]} redirectTo="/attendance?next=/driver/pickups">
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="border-b-1">
          <NavbarWorker />
        </div>

        <div className="container mx-auto px-4 py-6 pb-24">
          <Card className={`shadow-card ${theme.borderClass} ${theme.hoverShadowClass}`}>
            <CardHeader>
              <CardTitle className={`text-xl ${theme.textClass}`}>All Pickup and Deliver Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => {
                  setPickupPage(1);
                  setSearchInput(e.target.value);
                }}
                placeholder="Cari berdasarkan Pickup / Order ID"
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Start Date</p>
                <Input
                  type="date"
                  value={draftStartDate}
                  onChange={(e) => setDraftStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">End Date</p>
                <Input
                  type="date"
                  value={draftEndDate}
                  onChange={(e) => setDraftEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                className={theme.solidButtonClass}
                onClick={() => {
                  setPickupPage(1);
                  setStartDate(draftStartDate);
                  setEndDate(draftEndDate);
                }}
                disabled={dashboardQ.isFetching}
              >
                Terapkan Filter
              </Button>
              <Button
                variant="outline"
                className={theme.ghostButtonClass}
                onClick={() => {
                  setPickupPage(1);
                  setDraftStartDate("");
                  setDraftEndDate("");
                  setStartDate("");
                  setEndDate("");
                  setSearchInput("");
                }}
                disabled={dashboardQ.isFetching}
              >
                Reset
              </Button>
            </div>

            {!isAllowed ? (
              <p className="text-sm text-muted-foreground">Check-in dulu untuk melihat pickup request.</p>
            ) : dashboardQ.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : dashboardQ.isError ? (
              <p className="text-sm text-destructive">Gagal memuat pickup request.</p>
            ) : pageItems.length > 0 ? (
              <div className="space-y-2">
                {pageItems.map((item, index) => (
                  <DriverPickupRequestCard
                    key={String(getObj(item).id ?? getObj(item).pickupId ?? `pickup-${currentPage}-${index}`)}
                    pickup={item}
                    dashboardParams={{ pageSize: fetchLimit, taskPage, pickupPage: 1 }}
                    disabled={!isAllowed}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Tidak ada pickup request yang cocok dengan filter saat ini.</p>
            )}

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className={theme.ghostButtonClass}
                  onClick={() => setPickupPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || dashboardQ.isFetching}
                >
                  Prev
                </Button>
                <p className="text-xs text-muted-foreground">Page {currentPage}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className={theme.ghostButtonClass}
                  onClick={() => setPickupPage((p) => p + 1)}
                  disabled={!hasNextPage || dashboardQ.isFetching}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <BottomNav role="DRIVER" />
      </div>
    </RequireCheckInRQ>
  );
}
