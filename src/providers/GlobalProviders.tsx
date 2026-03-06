"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { ReduxProvider } from "./ReduxProvider";
import { ToastProvider } from "./ToastProvider";
import { ApolloWrapper } from "./ApolloWrapper";

export function GlobalProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ReduxProvider>
        <ToastProvider>
          <ApolloWrapper>
            {children}
          </ApolloWrapper>
        </ToastProvider>
      </ReduxProvider>
    </ThemeProvider>
  );
}