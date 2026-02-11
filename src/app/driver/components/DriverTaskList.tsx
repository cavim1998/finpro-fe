"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import * as React from "react";
import DriverTaskCard from "./DriverTaskCard";

type Props = {
  isAllowed: boolean;
  myTasks: any[];

  // ambil dari parent (DriverDashboard) biar invalidate key lengkap
  pickupPage: number;

  // opsional: kalau parent juga pegang pageSize dan kamu mau konsisten
  pageSize?: number;
};

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export default function DriverTaskList({
  isAllowed,
  myTasks,
  pickupPage,
  pageSize: pageSizeProp,
}: Props) {
  const pageSize = pageSizeProp ?? 5;
  const [taskPage, setTaskPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(myTasks.length / pageSize));
  const pageItems = paginate(myTasks, taskPage, pageSize);

  React.useEffect(() => {
    if (taskPage > totalPages) setTaskPage(totalPages);
  }, [taskPage, totalPages]);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl">My Tasks</CardTitle>
        <Link
          href="/driver/tasks"
          className="text-l text-primary font-medium border p-1.5 rounded-xl"
        >
          View all
        </Link>
      </CardHeader>

      <CardContent className="space-y-3">
        {!isAllowed ? (
          <p className="text-sm text-muted-foreground">
            Check-in dulu untuk melihat task.
          </p>
        ) : pageItems.length > 0 ? (
          <div className="space-y-2">
            {pageItems.map((t) => (
              <DriverTaskCard
                key={t.id}
                task={t}
                dashboardParams={{ pageSize, taskPage, pickupPage }}
                disabled={!isAllowed}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Belum ada task.</p>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTaskPage((p) => Math.max(1, p - 1))}
            disabled={taskPage <= 1}
          >
            Prev
          </Button>

          <p className="text-xs text-muted-foreground">
            Page {taskPage} / {totalPages}
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setTaskPage((p) => Math.min(totalPages, p + 1))}
            disabled={taskPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}