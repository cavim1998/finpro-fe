"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReactQueryProvider>
        <NuqsAdapter>
          {children}
        </NuqsAdapter>
      </ReactQueryProvider>
    </SessionProvider>
  );
}