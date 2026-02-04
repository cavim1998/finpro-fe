"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { AttendanceLog } from "@/types";

type AttendanceToday = {
  outletStaffId: number;
  outletId: number;
  date: Date;
  log: AttendanceLog | null;
  isCheckedIn: boolean;
  isCompleted: boolean;
};

type AttendanceContextType = {
  today: AttendanceToday | null;
  loadingToday: boolean;
  refreshToday: () => Promise<void>;

  // actions
  clockIn: (notes?: string) => Promise<void>;
  clockOut: (notes?: string) => Promise<void>;

  // compatibility (biar kode lama ga langsung pecah)
  isUserCheckedIn: (_outletStaffId?: number) => boolean;
};

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

function toDate(v: any): Date {
  return v ? new Date(v) : new Date();
}

function normalizeAttendanceLog(raw: any): AttendanceLog {
  return {
    id: raw.id,
    outletStaffId: raw.outletStaffId,
    date: toDate(raw.date),
    clockInAt: raw.clockInAt ? toDate(raw.clockInAt) : undefined,
    clockOutAt: raw.clockOutAt ? toDate(raw.clockOutAt) : undefined,
    notes: raw.notes ?? undefined,
    createdAt: toDate(raw.createdAt),
    updatedAt: toDate(raw.updatedAt),
  };
}

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [today, setToday] = useState<AttendanceToday | null>(null);
  const [loadingToday, setLoadingToday] = useState(false);

  const refreshToday = useCallback(async () => {
    setLoadingToday(true);
    try {
      const res = await axiosInstance.get("/attendance/me/today");
      const data = res.data?.data;

      const normalized: AttendanceToday = {
        outletStaffId: data.outletStaffId,
        outletId: data.outletId,
        date: toDate(data.date),
        log: data.log ? normalizeAttendanceLog(data.log) : null,
        isCheckedIn: !!data.isCheckedIn,
        isCompleted: !!data.isCompleted,
      };

      setToday(normalized);
    } finally {
      setLoadingToday(false);
    }
  }, []);

  const clockIn = useCallback(async (notes?: string) => {
    await axiosInstance.post("/attendance/me/clock-in", { notes });
    await refreshToday();
  }, [refreshToday]);

  const clockOut = useCallback(async (notes?: string) => {
    await axiosInstance.post("/attendance/me/clock-out", { notes });
    await refreshToday();
  }, [refreshToday]);

  const isUserCheckedIn = useCallback((_outletStaffId?: number) => {
    return !!today?.isCheckedIn;
  }, [today]);

  useEffect(() => {
    refreshToday().catch(() => {});
  }, [refreshToday]);

  const value = useMemo(
    () => ({
      today,
      loadingToday,
      refreshToday,
      clockIn,
      clockOut,
      isUserCheckedIn,
    }),
    [today, loadingToday, refreshToday, clockIn, clockOut, isUserCheckedIn]
  );

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error("useAttendance must be used within AttendanceProvider");
  return ctx;
}