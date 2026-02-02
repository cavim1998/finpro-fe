"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

import { AuthProvider } from "@/contexts/AuthContext";
import { OrderProvider } from "@/contexts/OrderContext"; // ✅ tambahin ini
import { AttendanceProvider } from "@/contexts/AttendanceContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReactQueryProvider>
        <NuqsAdapter>
          <AuthProvider>
            <OrderProvider>
              <AttendanceProvider> 
                {children}
              </AttendanceProvider>
            </OrderProvider>
          </AuthProvider>
        </NuqsAdapter>
      </ReactQueryProvider>
    </SessionProvider>
  );
}