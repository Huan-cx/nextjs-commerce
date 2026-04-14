"use client";

import {ReactNode} from "react";
import {ThemeProvider} from "./ThemeProvider";
import {ToastProvider} from "./ToastProvider";
import {QueryClientWrapper} from "./ReactQueryWrapper";
import {StoreProvider} from "./StoreProvider";
import {NextAuthProvider} from "@/providers/NextAuthProvider";

export function GlobalProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <StoreProvider>
        <ToastProvider>
          <NextAuthProvider>
            <QueryClientWrapper>
              {children}
            </QueryClientWrapper>
          </NextAuthProvider>
        </ToastProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}