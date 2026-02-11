"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

type Props = {
  isAllowed: boolean;
  labels?: Partial<{
    myTasksTitle: string;
    incomingTitle: string;
    viewAll: string;
    emptyMyTasks: string;
    emptyIncoming: string;
  }>;
};

export default function WorkerLists({ isAllowed, labels }: Props) {
  const l = {
    myTasksTitle: labels?.myTasksTitle ?? "My Tasks / Station",
    incomingTitle: labels?.incomingTitle ?? "Incoming Orders",
    viewAll: labels?.viewAll ?? "View all",
    emptyMyTasks: labels?.emptyMyTasks ?? "Belum ada task.",
    emptyIncoming: labels?.emptyIncoming ?? "Belum ada incoming order.",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{l.myTasksTitle}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {isAllowed ? l.emptyMyTasks : "Silakan check-in dulu."}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{l.incomingTitle}</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1">
            {l.viewAll} <ChevronRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {isAllowed ? l.emptyIncoming : "Silakan check-in dulu."}
        </CardContent>
      </Card>
    </div>
  );
}