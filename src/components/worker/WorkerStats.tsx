"use client";

import { Card } from "@/components/ui/card";
import type { StationType } from "@/types";
import { CheckCircle2, Droplets, Flame, Package, Shirt } from "lucide-react";

type Props = {
  station: StationType;
  incoming: number;
  inProgress: number;
  completed: number;
  onIncomingClick?: () => void;
  onInProgressClick?: () => void;
  onCompletedClick?: () => void;
};

export default function WorkerStats({
  station,
  incoming,
  inProgress,
  completed,
  onIncomingClick,
  onInProgressClick,
  onCompletedClick,
}: Props) {
  const InProgressIcon =
    station === "WASHING"
      ? Droplets
      : station === "IRONING"
        ? Flame
        : Package;
  const inProgressIconClass =
    station === "WASHING"
      ? "text-blue-500"
      : station === "IRONING"
        ? "text-red-500"
        : "text-[#1dacbc]";
  const inProgressValueClass =
    station === "WASHING"
      ? "text-blue-500"
      : station === "IRONING"
        ? "text-red-500"
        : "text-[#1dacbc]";
  const inProgressBadgeClass =
    station === "WASHING"
      ? "bg-blue-50"
      : station === "IRONING"
        ? "bg-red-50"
        : "bg-cyan-50";
  const incomingCardClass =
    "border-transparent transition-all hover:border-[#1dacbc] hover:shadow-[0_0_0_3px_rgba(29,172,188,0.12)]";
  const inProgressCardClass =
    station === "WASHING"
      ? "border-transparent transition-all hover:border-blue-500 hover:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
      : station === "IRONING"
        ? "border-transparent transition-all hover:border-red-500 hover:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
        : "border-transparent transition-all hover:border-[#1dacbc] hover:shadow-[0_0_0_3px_rgba(29,172,188,0.12)]";
  const completedCardClass =
    "border-transparent transition-all hover:border-green-600 hover:shadow-[0_0_0_3px_rgba(22,163,74,0.12)]";
  const handleKeyDown = (callback?: () => void) =>
    callback
      ? (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            callback();
          }
        }
      : undefined;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card
        className={`p-4 rounded-2xl ${incomingCardClass} ${onIncomingClick ? "cursor-pointer" : ""}`}
        onClick={onIncomingClick}
        role={onIncomingClick ? "button" : undefined}
        tabIndex={onIncomingClick ? 0 : undefined}
        onKeyDown={handleKeyDown(onIncomingClick)}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50">
            <Shirt className="h-5 w-5 text-[#1dacbc]" />
          </div>
          <div className="text-2xl font-bold text-[#1dacbc]">{incoming}</div>
          <div className="text-xs text-black">Incoming</div>
        </div>
      </Card>

      <Card
        className={`p-4 rounded-2xl ${inProgressCardClass} ${onInProgressClick ? "cursor-pointer" : ""}`}
        onClick={onInProgressClick}
        role={onInProgressClick ? "button" : undefined}
        tabIndex={onInProgressClick ? 0 : undefined}
        onKeyDown={handleKeyDown(onInProgressClick)}
      >
        <div className="flex flex-col items-center gap-2">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${inProgressBadgeClass}`}>
            <InProgressIcon className={`h-5 w-5 ${inProgressIconClass}`} />
          </div>
          <div className={`text-2xl font-bold ${inProgressValueClass}`}>{inProgress}</div>
          <div className="text-xs text-black">In Progress</div>
        </div>
      </Card>

      <Card
        className={`p-4 rounded-2xl ${completedCardClass} ${onCompletedClick ? "cursor-pointer hover:bg-accent/20" : ""}`}
        onClick={onCompletedClick}
        role={onCompletedClick ? "button" : undefined}
        tabIndex={onCompletedClick ? 0 : undefined}
        onKeyDown={handleKeyDown(onCompletedClick)}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{completed}</div>
          <div className="text-xs text-black">Completed</div>
        </div>
      </Card>
    </div>
  );
}
