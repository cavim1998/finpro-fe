"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle2, Package } from "lucide-react";

type Props = {
  incoming: number;
  inProgress: number;
  completed: number;
};

export default function WorkerStats({
  incoming,
  inProgress,
  completed,
}: Props) {

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="p-4 rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <Package className="h-5 w-5" />
          <div className="text-2xl font-bold">{incoming}</div>
          <div className="text-xs text-muted-foreground">Incoming</div>
        </div>
      </Card>

      <Card className="p-4 rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <Package className="h-5 w-5" />
          <div className="text-2xl font-bold">{inProgress}</div>
          <div className="text-xs text-muted-foreground">In Progress</div>
        </div>
      </Card>

      <Card className="p-4 rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <div className="text-2xl font-bold">{completed}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
      </Card>
    </div>
  );
}