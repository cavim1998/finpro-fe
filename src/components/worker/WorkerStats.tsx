"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle2, Package } from "lucide-react";

type Props = {
  incoming: number;
  inProgress: number;
  completed: number;
  labels?: Partial<{
    incoming: string;
    inProgress: string;
    completed: string;
  }>;
};

export default function WorkerStats({
  incoming,
  inProgress,
  completed,
  labels,
}: Props) {
  const l = {
    incoming: labels?.incoming ?? "Incoming",
    inProgress: labels?.inProgress ?? "In Progress",
    completed: labels?.completed ?? "Completed",
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="p-4 rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <Package className="h-5 w-5" />
          <div className="text-2xl font-bold">{incoming}</div>
          <div className="text-xs text-muted-foreground">{l.incoming}</div>
        </div>
      </Card>

      <Card className="p-4 rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <Package className="h-5 w-5" />
          <div className="text-2xl font-bold">{inProgress}</div>
          <div className="text-xs text-muted-foreground">{l.inProgress}</div>
        </div>
      </Card>

      <Card className="p-4 rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <div className="text-2xl font-bold">{completed}</div>
          <div className="text-xs text-muted-foreground">{l.completed}</div>
        </div>
      </Card>
    </div>
  );
}