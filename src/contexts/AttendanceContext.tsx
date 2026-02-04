"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AttendanceLog, RoleCode, StationType } from "@/types";

interface AttendanceContextType {
  attendanceRecords: AttendanceLog[];
  checkIn: (
    outletStaffId: number,
    userName: string,
    userRole: RoleCode,
    outletId?: number,
    workerStation?: StationType
  ) => void;
  checkOut: (outletStaffId: number) => void;

  getAttendanceByUser: (outletStaffId: number) => AttendanceLog[];
  getAttendanceByOutlet: (outletId: number) => AttendanceLog[];
  getAttendanceByDate: (date: string) => AttendanceLog[];
  isUserCheckedIn: (outletStaffId: number) => boolean;
  getTodayAttendance: (outletStaffId: number) => AttendanceLog | null;
}

interface ExtendedAttendanceLog extends AttendanceLog {
  userName?: string;
  userRole?: RoleCode;
  workerStation?: StationType;
  outletId?: number;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined
);

const initialAttendance: ExtendedAttendanceLog[] = [
  {
    id: 1,
    outletStaffId: 1,
    userName: "Mike Driver",
    userRole: "DRIVER",
    outletId: 1,
    clockInAt: new Date(Date.now() - 3600000 * 3),
    date: new Date(),
    createdAt: new Date(),
  },
  {
    id: 2,
    outletStaffId: 2,
    userName: "Sarah Washer",
    userRole: "WORKER",
    workerStation: "WASHING",
    outletId: 1,
    clockInAt: new Date(Date.now() - 3600000 * 4),
    date: new Date(),
    createdAt: new Date(),
  },
  {
    id: 3,
    outletStaffId: 3,
    userName: "Tom Ironer",
    userRole: "WORKER",
    workerStation: "IRONING",
    outletId: 1,
    clockInAt: new Date(Date.now() - 3600000 * 2),
    date: new Date(),
    createdAt: new Date(),
  },
];

function toDateKey(d: Date) {
  return d.toISOString().split("T")[0];
}

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [attendanceRecords, setAttendanceRecords] =
    useState<ExtendedAttendanceLog[]>(initialAttendance);

  const getTodayAttendance = useCallback(
    (outletStaffId: number) => {
      const todayKey = toDateKey(new Date());
      return (
        attendanceRecords.find(
          (a) =>
            a.outletStaffId === outletStaffId &&
            toDateKey(a.date) === todayKey &&
            !a.clockOutAt
        ) || null
      );
    },
    [attendanceRecords]
  );

  const isUserCheckedIn = useCallback(
    (outletStaffId: number) => {
      return !!getTodayAttendance(outletStaffId);
    },
    [getTodayAttendance]
  );

  const checkIn = useCallback(
    (
      outletStaffId: number,
      userName: string,
      userRole: RoleCode,
      outletId?: number,
      workerStation?: StationType
    ) => {
      const existing = getTodayAttendance(outletStaffId);
      if (existing) return; // already checked-in

      const today = new Date();

      const newAttendance: ExtendedAttendanceLog = {
        id: Date.now(),
        outletStaffId,
        userName,
        userRole,
        workerStation,
        outletId,
        clockInAt: new Date(),
        date: today,
        createdAt: new Date(),
      };

      setAttendanceRecords((prev) => [...prev, newAttendance]);
    },
    [getTodayAttendance]
  );

  const checkOut = useCallback((outletStaffId: number) => {
    const todayKey = toDateKey(new Date());

    setAttendanceRecords((prev) =>
      prev.map((record) => {
        const isTarget =
          record.outletStaffId === outletStaffId &&
          toDateKey(record.date) === todayKey &&
          !record.clockOutAt;

        if (!isTarget) return record;
        return { ...record, clockOutAt: new Date() };
      })
    );
  }, []);

  const getAttendanceByUser = useCallback(
    (outletStaffId: number) => {
      return attendanceRecords.filter((a) => a.outletStaffId === outletStaffId);
    },
    [attendanceRecords]
  );

  const getAttendanceByOutlet = useCallback(
    (outletId: number) => {
      return attendanceRecords.filter((a) => a.outletId === outletId);
    },
    [attendanceRecords]
  );

  const getAttendanceByDate = useCallback(
    (date: string) => {
      return attendanceRecords.filter((a) => toDateKey(a.date) === date);
    },
    [attendanceRecords]
  );

  return (
    <AttendanceContext.Provider
      value={{
        attendanceRecords,
        checkIn,
        checkOut,
        getAttendanceByUser,
        getAttendanceByOutlet,
        getAttendanceByDate,
        isUserCheckedIn,
        getTodayAttendance,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
}