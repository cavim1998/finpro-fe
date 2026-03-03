"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bell, Clock3 } from "lucide-react";
import * as React from "react";
import ConfirmActionDialog from "@/app/attendance/components/ConfirmActionDialog";

export type WorkerHeaderTheme = {
  headerBgClass?: string;
  badgeClass?: string;
};

type Props = {
  displayName: string;
  headerTitle: string;
  headerSubtitle?: string;

  loadingToday: boolean;
  isCheckedIn: boolean;
  isCompleted: boolean;
  sinceText: string;

  onClockOut: () => void | Promise<void>;
  clockOutLoading?: boolean;

  theme?: WorkerHeaderTheme;
  clockOutLabel?: string;
  incomingCount?: number;
  notificationOpen?: boolean;
  onNotificationOpenChange?: (open: boolean) => void;
  notificationContent?: React.ReactNode;
};

export default function WorkerHeader({
  displayName,
  headerTitle,
  loadingToday,
  isCheckedIn,
  isCompleted,
  sinceText,
  onClockOut,
  clockOutLoading,
  theme,
  clockOutLabel = "Check Out",
  incomingCount = 0,
  notificationOpen = false,
  onNotificationOpenChange,
  notificationContent,
}: Props) {
  const [openClockOut, setOpenClockOut] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const badgeText = loadingToday
    ? "Loading..."
    : isCompleted
    ? "Selesai"
    : isCheckedIn
    ? "Sedang shift"
    : "Belum shift";

  const badgeClass =
    theme?.badgeClass ??
    (isCompleted
      ? "text-emerald-600"
      : isCheckedIn
      ? "text-green-600"
      : "text-muted-foreground");

  const handleConfirmClockOut = async () => {
    setErrorMsg(null);
    try {
      await onClockOut();
      setOpenClockOut(false);
    } catch (e: unknown) {
      const msg: string =
        typeof e === "object" &&
        e !== null &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message ===
          "string"
          ? ((e as { response?: { data?: { message?: string } } }).response?.data?.message ??
            "Clock-out gagal.")
          : "Clock-out gagal.";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="p-4 pt-6 pb-8 rounded-b-3xl bg-gradient-to-r from-[#1dacbc] to-[#0b6c75]">
      <div className="flex items-center justify-between">
        <div className="">
          <h1 className="text-xl font-bold text-[#ffffff]">
            Selamat bekerja,
            <span className="ml-1 font-semibold text-foreground">
              {displayName}!
            </span>
          </h1>
          <h2 className="text-xl font-bold pb-4">{headerTitle}</h2>
          {/* {headerSubtitle ? (
            <p className="text-sm text-muted-foreground">{headerSubtitle}</p>
          ) : null} */}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full bg-white text-[#1dacbc] hover:bg-[#1dacbc] hover:text-white"
          onClick={() => onNotificationOpenChange?.(true)}
        >
          <Bell className="h-5 w-5" />
          {incomingCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {incomingCount > 99 ? "99+" : incomingCount}
            </span>
          ) : null}
        </Button>
      </div>

      <Card
        className={[
          "p-4 rounded-2xl border",
          theme?.headerBgClass ??
            "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-primary/5 to-transparent",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Attendance</p>
            <p className={["font-semibold", badgeClass].join(" ")}>{badgeText}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              <span>Clock in: {sinceText}</span>
            </div>
          </div>

          <Button
            variant="outline"
            disabled={!isCheckedIn || isCompleted || clockOutLoading}
            onClick={() => setOpenClockOut(true)}
            className="rounded-xl"
          >
            {clockOutLabel}
          </Button>
        </div>

        {errorMsg ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMsg}
          </div>
        ) : null}
      </Card>

      <ConfirmActionDialog
        open={openClockOut}
        onOpenChange={setOpenClockOut}
        title="Konfirmasi Check Out"
        description="Apakah kamu yakin ingin check-out sekarang? Setelah check-out, shift akan terkunci sampai besok."
        confirmText="Ya, Check Out"
        cancelText="Batal"
        loading={!!clockOutLoading}
        onConfirm={handleConfirmClockOut}
      />

      <Dialog open={notificationOpen} onOpenChange={onNotificationOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Incoming Tasks</DialogTitle>
            <DialogDescription>
              {incomingCount > 0
                ? `Ada ${incomingCount} task masuk untuk station ini.`
                : "Belum ada task masuk saat ini."}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {notificationContent}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
