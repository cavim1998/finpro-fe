"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import DriverTaskCard from "./DriverTaskCard";

type TaskLike = Record<string, unknown>;

type Props = {
  isAllowed: boolean;
  myTasks: TaskLike[];
  page: number;
  hasNextPage: boolean;
  loading?: boolean;
  onPrev: () => void;
  onNext: () => void;
  showViewAll?: boolean;
  viewAllHref?: string;
  title?: string;
};

export default function DriverTaskList({
  isAllowed,
  myTasks,
  page,
  hasNextPage,
  loading,
  onPrev,
  onNext,
  showViewAll = true,
  viewAllHref = "/driver/tasks",
  title = "My Tasks",
}: Props) {
  const getTaskKey = (task: TaskLike, index: number) => {
    const id = task.id ?? task.taskId ?? task.task_id;
    if (typeof id === "string" || typeof id === "number") return String(id);
    return `task-${page}-${index}`;
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl">{title}</CardTitle>
        {showViewAll ? (
          <Link
            href={viewAllHref}
            className="text-l text-primary font-medium border p-1.5 rounded-xl"
          >
            View all
          </Link>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3">
        {!isAllowed ? (
          <p className="text-sm text-muted-foreground">
            Check-in dulu untuk melihat task.
          </p>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : myTasks.length > 0 ? (
          <div className="space-y-2">
            {myTasks.map((t, index) => (
              <DriverTaskCard
                key={getTaskKey(t, index)}
                task={t}
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
            onClick={onPrev}
            disabled={page <= 1 || !!loading}
          >
            Prev
          </Button>

          <p className="text-xs text-muted-foreground">
            Page {page}
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={!hasNextPage || !!loading}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
