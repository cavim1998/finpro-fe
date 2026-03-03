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
  dashboardMode?: boolean;
  totalItems?: number | null;
  pageSize?: number;
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
  dashboardMode = false,
  totalItems = null,
  pageSize = myTasks.length,
  loading,
  onPrev,
  onNext,
  showViewAll = true,
  viewAllHref = "/driver",
  title = "My Tasks",
}: Props) {
  const getTaskKey = (task: TaskLike, index: number) => {
    const id = task.id ?? task.taskId ?? task.task_id;
    if (typeof id === "string" || typeof id === "number") return String(id);
    return `task-${page}-${index}`;
  };
  const pageLabel = getPageLabel(page, pageSize, totalItems, hasNextPage);

  return (
    <Card
      className={[
        "rounded-2xl border-orange-200 shadow-card transition-shadow hover:shadow-[0_16px_36px_rgba(249,115,22,0.16)]",
        dashboardMode ? "flex h-full min-h-[25rem] flex-col" : "",
      ].join(" ")}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl text-orange-500">{title}</CardTitle>
        {showViewAll ? (
          <Link
            href={viewAllHref}
            className="rounded-xl border border-orange-200 p-1.5 text-l font-medium text-orange-500 transition-colors hover:bg-orange-50"
          >
            View all
          </Link>
        ) : null}
      </CardHeader>

      <CardContent className={dashboardMode ? "flex flex-1 flex-col" : "space-y-6"}>
        {!isAllowed ? (
          <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
            Check-in dulu untuk melihat task.
          </div>
        ) : loading ? (
          <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : myTasks.length > 0 ? (
          <div className="space-y-6">
            <div className="space-y-3">
              {myTasks.map((t, index) => (
                <DriverTaskCard
                  key={getTaskKey(t, index)}
                  task={t}
                  disabled={!isAllowed}
                />
              ))}
              {dashboardMode && myTasks.length === 1 ? (
                <div aria-hidden className="min-h-[7.25rem]" />
              ) : null}
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                disabled={page <= 1 || !!loading}
              >
                Prev
              </Button>

              <div className="text-center text-xs text-muted-foreground">{pageLabel}</div>

              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!hasNextPage || !!loading}
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
              Belum ada task.
            </div>

            <div className="flex items-center justify-between pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                disabled={page <= 1 || !!loading}
              >
                Prev
              </Button>

              <div className="text-center text-xs text-muted-foreground">{pageLabel}</div>

              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!hasNextPage || !!loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getPageLabel(
  currentPage: number,
  pageSize: number,
  totalItems: number | null,
  hasNextPage: boolean,
) {
  const totalPages =
    Number.isFinite(totalItems) && totalItems !== null
      ? Math.max(1, Math.ceil(totalItems / pageSize))
      : hasNextPage
        ? currentPage + 1
        : currentPage;

  return `Page ${currentPage} dari ${totalPages}`;
}
