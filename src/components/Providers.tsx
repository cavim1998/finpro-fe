"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

import { AuthProvider } from "@/contexts/AuthContext";
import { OrderProvider } from "@/contexts/OrderContext"; // ✅ tambahin ini
import { AttendanceProvider } from "@/contexts/AttendanceContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const content = (
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

  if (!googleClientId) return content;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {content}
    </GoogleOAuthProvider>
  );
}