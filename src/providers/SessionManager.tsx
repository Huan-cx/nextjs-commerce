"use client";

import { SessionProvider } from "next-auth/react";
import { SessionSync } from "./SessionSync";
import { ReactNode } from "react";

export function SessionManager({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync />
      {children}
    </SessionProvider>
  );
}