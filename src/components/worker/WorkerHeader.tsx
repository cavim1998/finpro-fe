"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, Clock3 } from "lucide-react";

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

  onClockOut: () => void;
  clockOutLoading?: boolean;

  theme?: WorkerHeaderTheme;
  clockOutLabel?: string;
};

export default function WorkerHeader({
  displayName,
  headerTitle,
  headerSubtitle,
  loadingToday,
  isCheckedIn,
  isCompleted,
  sinceText,
  onClockOut,
  clockOutLoading,
  theme,
  clockOutLabel = "Check Out",
}: Props) {
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

        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
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
            onClick={onClockOut}
            className="rounded-xl"
          >
            {clockOutLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}