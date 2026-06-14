"use client";

import {ReactNode} from "react";
import {ThemeProvider} from "./ThemeProvider";
import {ToastProvider} from "./ToastProvider";
import {QueryClientWrapper} from "./ReactQueryWrapper";
import {StoreProvider} from "./StoreProvider";
import {SessionManager} from "@/providers/SessionManager";

/**
 * 全局 Provider 聚合层
 *
 * 【架构说明】
 * - SessionManager 是唯一的 NextAuth SessionProvider
 * - 整个应用只在此处实例化一次，彻底消除多重嵌套问题
 * - SessionSync 也在 SessionManager 内部，确保全应用的 token 状态同步
 */
export function GlobalProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <StoreProvider>
        <ToastProvider>
          {/* 唯一的 SessionProvider 入口，全应用共享同一份 session 状态 */}
          <SessionManager>
            <QueryClientWrapper>
              {children}
            </QueryClientWrapper>
          </SessionManager>
        </ToastProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
