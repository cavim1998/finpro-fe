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
import DriverTaskCard from "@/app/driver/components/DriverTaskCard";

function isCompletedTask(task: unknown) {
  if (typeof task !== "object" || task === null) return false;
  const status = String((task as { status?: unknown }).status ?? "").toUpperCase();
  return status === "DONE" || status === "COMPLETED";
}

function getObj(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function formatDateInput(value?: string | Date | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DriverOutletHistoryPage() {
  const params = useParams<{ outletStaffId: string }>();
  const router = useRouter();
  const fetchLimit = 50;
  const pageSize = 5;
  const [taskPage, setTaskPage] = useState(1);
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput.trim().toLowerCase(), 400);
  const pickupPage = 1;

  const attendanceQ = useAttendanceTodayQuery();
  const isAllowed = !!attendanceQ.data?.isCheckedIn && !attendanceQ.data?.isCompleted;
  const ownOutletStaffId = Number(attendanceQ.data?.outletStaffId ?? 0);
  const routeOutletStaffId = Number(params?.outletStaffId ?? 0);

  useEffect(() => {
    if (!Number.isFinite(ownOutletStaffId) || ownOutletStaffId <= 0) return;
    if (routeOutletStaffId === ownOutletStaffId) return;

    router.replace(`/driver/history/${ownOutletStaffId}`);
  }, [ownOutletStaffId, routeOutletStaffId, router]);

  const dashboardQ = useDriverDashboard({ pageSize: fetchLimit, taskPage: 1, pickupPage });

  const filteredItems = useMemo(() => {
    const allTasks = dashboardQ.data?.tasks?.items ?? [];
    const completedTasks = allTasks.filter(isCompletedTask);

    return completedTasks.filter((item) => {
      const task = getObj(item);
      const pickupRequest = getObj(task.pickupRequest);
      const taskId = String(task.id ?? task.taskId ?? task.task_id ?? "");
      const pickupId = String(
        pickupRequest.id ?? pickupRequest.pickupId ?? pickupRequest.pickup_id ?? "",
      );
      const orderId = String(pickupRequest.orderId ?? pickupRequest.order_id ?? "");
      const createdAt = formatDateInput(
        (pickupRequest.createdAt as string | undefined) ?? undefined,
      );

      const matchesSearch =
        !search ||
        taskId.toLowerCase().includes(search) ||
        pickupId.toLowerCase().includes(search) ||
        orderId.toLowerCase().includes(search);
      const matchesStart = !startDate || (createdAt && createdAt >= startDate);
      const matchesEnd = !endDate || (createdAt && createdAt <= endDate);

      return matchesSearch && matchesStart && matchesEnd;
    });
  }, [dashboardQ.data?.tasks?.items, endDate, search, startDate]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(taskPage, totalPages);
  const pageItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const hasNextPage = currentPage < totalPages;
  const theme = {
    textClass: "text-green-600",
    borderClass: "border-green-200",
    hoverShadowClass: "hover:shadow-[0_16px_36px_rgba(34,197,94,0.14)]",
    solidButtonClass: "bg-green-50 text-green-700 hover:bg-green-100",
    ghostButtonClass: "border-green-200 text-green-600 hover:bg-green-50",
  };

  return (
    <RequireCheckInRQ roles={["DRIVER"]} redirectTo="/attendance?next=/driver/history">
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="border-b-1">
          <NavbarWorker />
        </div>

        <div className="container mx-auto px-4 py-6 pb-24">
          <Card className={`shadow-card ${theme.borderClass} ${theme.hoverShadowClass}`}>
            <CardHeader>
              <CardTitle className={`text-xl ${theme.textClass}`}>Completed Driver Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => {
                  setTaskPage(1);
                  setSearchInput(e.target.value);
                }}
                placeholder="Cari berdasarkan Task / Pickup / Order ID"
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
                  setTaskPage(1);
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
                  setTaskPage(1);
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
              <p className="text-sm text-muted-foreground">Check-in dulu untuk melihat task.</p>
            ) : dashboardQ.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : dashboardQ.isError ? (
              <p className="text-sm text-destructive">Gagal memuat history driver.</p>
            ) : pageItems.length > 0 ? (
              <div className="space-y-2">
                {pageItems.map((item, index) => (
                  <DriverTaskCard
                    key={String(getObj(item).id ?? getObj(item).taskId ?? `task-${currentPage}-${index}`)}
                    task={item}
                    disabled={!isAllowed}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Tidak ada task yang cocok dengan filter saat ini.</p>
            )}

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className={theme.ghostButtonClass}
                  onClick={() => setTaskPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || dashboardQ.isFetching}
                >
                  Prev
                </Button>
                <p className="text-xs text-muted-foreground">Page {currentPage}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className={theme.ghostButtonClass}
                  onClick={() => setTaskPage((p) => p + 1)}
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
