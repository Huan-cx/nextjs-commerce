"use client";

import {ReactNode} from "react";
import {ThemeProvider} from "./ThemeProvider";
import {ReduxProvider} from "./ReduxProvider";
import {ToastProvider} from "./ToastProvider";
import {QueryClientWrapper} from "./ReactQueryWrapper";

export function GlobalProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ReduxProvider>
        <ToastProvider>
          <QueryClientWrapper>
            {children}
          </QueryClientWrapper>
        </ToastProvider>
      </ReduxProvider>
    </ThemeProvider>
  );
}