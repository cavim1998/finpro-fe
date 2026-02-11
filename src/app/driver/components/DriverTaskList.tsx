"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import * as React from "react";

type Props = {
  isAllowed: boolean;
  myTasks: any[];
};

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export default function DriverTaskList({ isAllowed, myTasks }: Props) {
  const pageSize = 5;
  const [taskPage, setTaskPage] = React.useState(1);

  const taskTotalPages = Math.max(1, Math.ceil(myTasks.length / pageSize));
  const taskPageItems = paginate(myTasks, taskPage, pageSize);

  // kalau data berubah (nanti dari backend), jaga page tidak out-of-range
  React.useEffect(() => {
    if (taskPage > taskTotalPages) setTaskPage(taskTotalPages);
  }, [taskPage, taskTotalPages]);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl">My Tasks / Delivery</CardTitle>
        {/* <Link
          href="/driver/orders"
          className="text-m text-primary font-medium border p-1 rounded-sm bg-"
        >
          View all
        </Link> */}
      </CardHeader>

      <CardContent className="space-y-3">
        {!isAllowed ? (
          <p className="text-sm text-muted-foreground">
            Check-in dulu untuk melihat task.
          </p>
        ) : taskPageItems.length > 0 ? (
          <div className="space-y-2">
            {taskPageItems.map((t, idx) => (
              <div key={idx} className="rounded-lg border p-3 text-sm">
                Task item
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Belum ada task.</p>
        )}

        {/* <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTaskPage((p) => Math.max(1, p - 1))}
            disabled={taskPage <= 1}
          >
            Prev
          </Button>

          <p className="text-xs text-muted-foreground">
            Page {taskPage} / {taskTotalPages}
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setTaskPage((p) => Math.min(taskTotalPages, p + 1))}
            disabled={taskPage >= taskTotalPages}
          >
            Next
          </Button>
        </div> */}
      </CardContent>
    </Card>
  );
}
