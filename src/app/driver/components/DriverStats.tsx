"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ClipboardList, Truck } from "lucide-react";

type Props = {
  incoming: number;
  inProgress: number;
  completed: number;
};

export default function DriverStats({
  incoming,
  inProgress,
  completed,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="shadow-card bg-background/70">
        <CardContent className="p-3 text-center ">
          <Truck className="h-8 w-8 mx-auto mb-1" />
          <p className="text-xl font-bold">{incoming}</p>
          <p className="text-xl">Incoming</p>
        </CardContent>
      </Card>

      <Card className="shadow-card bg-background/70">
        <CardContent className="p-3 text-center">
          <ClipboardList className="h-8 w-8 mx-auto mb-1" />
          <p className="text-xl font-bold">{inProgress}</p>
          <p className="text-xl">In Progress</p>
        </CardContent>
      </Card>

      <Card className="shadow-card bg-background/70">
        <CardContent className="p-3 text-center">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-1 text-status-success" />
          <p className="text-xl font-bold">{completed}</p>
          <p className="text-xl">Completed</p>
        </CardContent>
      </Card>
    </div>
  );
}
