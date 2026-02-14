"use client";

import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import React from "react";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function Providers({ children }: { children: React.ReactNode }) {
  const content = (
    <SessionProvider>
      <ReactQueryProvider>
        <NuqsAdapter>{children}</NuqsAdapter>
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
