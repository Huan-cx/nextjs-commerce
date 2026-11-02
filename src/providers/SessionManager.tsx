"use client";

import {SessionProvider} from "next-auth/react";
import {SessionSync} from "./SessionSync";
import {ReactNode} from "react";

export function SessionManager({ children }: { children: ReactNode }) {
  return (
      <SessionProvider
          refetchInterval={5 * 60}
      >
      <SessionSync />
      {children}
    </SessionProvider>
  );
}