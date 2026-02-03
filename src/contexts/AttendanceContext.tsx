"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AttendanceLog, RoleCode, StationType } from '@/types';

interface AttendanceContextType {
  attendanceRecords: AttendanceLog[];
  todayAttendance: AttendanceLog | null;
  checkIn: (outletStaffId: number, userName: string, userRole: RoleCode, outletId?: number, workerStation?: StationType) => void;
  checkOut: (attendanceId: number) => void;
  getAttendanceByUser: (outletStaffId: number) => AttendanceLog[];
  getAttendanceByOutlet: (outletId: number) => AttendanceLog[];
  getAttendanceByDate: (date: string) => AttendanceLog[];
  isUserCheckedIn: (userId: string) => boolean;
}

// Extended attendance type with extra display info
interface ExtendedAttendanceLog extends AttendanceLog {
  userName?: string;
  userRole?: RoleCode;
  workerStation?: StationType;
  outletId?: number;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

// Demo attendance data
const initialAttendance: ExtendedAttendanceLog[] = [
  {
    id: 1,
    outletStaffId: 1,
    userName: 'Mike Driver',
    userRole: 'DRIVER',
    outletId: 1,
    clockInAt: new Date(Date.now() - 3600000 * 3),
    date: new Date(),
    createdAt: new Date(),
  },
  {
    id: 2,
    outletStaffId: 2,
    userName: 'Sarah Washer',
    userRole: 'WORKER',
    workerStation: 'WASHING',
    outletId: 1,
    clockInAt: new Date(Date.now() - 3600000 * 4),
    date: new Date(),
    createdAt: new Date(),
  },
  {
    id: 3,
    outletStaffId: 3,
    userName: 'Tom Ironer',
    userRole: 'WORKER',
    workerStation: 'IRONING',
    outletId: 1,
    clockInAt: new Date(Date.now() - 3600000 * 2),
    date: new Date(),
    createdAt: new Date(),
  },
];

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [attendanceRecords, setAttendanceRecords] = useState<ExtendedAttendanceLog[]>(initialAttendance);

  const checkIn = useCallback((outletStaffId: number, userName: string, userRole: RoleCode, outletId?: number, workerStation?: StationType) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const existingToday = attendanceRecords.find(
      a => a.outletStaffId === outletStaffId && 
      a.date.toISOString().split('T')[0] === todayStr && 
      !a.clockOutAt
    );
    
    if (existingToday) return; // Already checked in today

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
    
    setAttendanceRecords(prev => [...prev, newAttendance]);
  }, [attendanceRecords]);

  const checkOut = useCallback((attendanceId: number) => {
    setAttendanceRecords(prev => prev.map(record => {
      if (record.id !== attendanceId) return record;
      return { ...record, clockOutAt: new Date() };
    }));
  }, []);

  const getAttendanceByUser = useCallback((outletStaffId: number) => {
    return attendanceRecords.filter(a => a.outletStaffId === outletStaffId);
  }, [attendanceRecords]);

  const getAttendanceByOutlet = useCallback((outletId: number) => {
    return attendanceRecords.filter(a => a.outletId === outletId);
  }, [attendanceRecords]);

  const getAttendanceByDate = useCallback((date: string) => {
    return attendanceRecords.filter(a => a.date.toISOString().split('T')[0] === date);
  }, [attendanceRecords]);

  const isUserCheckedIn = useCallback((userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    // For demo purposes, we check by matching demo user IDs
    // In production, this would use outletStaffId
    return attendanceRecords.some(
      a => a.date.toISOString().split('T')[0] === today && !a.clockOutAt
    );
  }, [attendanceRecords]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.find(
    a => a.date.toISOString().split('T')[0] === todayStr && !a.clockOutAt
  ) || null;

  return (
    <AttendanceContext.Provider value={{
      attendanceRecords,
      todayAttendance,
      checkIn,
      checkOut,
      getAttendanceByUser,
      getAttendanceByOutlet,
      getAttendanceByDate,
      isUserCheckedIn,
    }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
