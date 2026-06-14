"use client";

import {signOut, useSession} from "next-auth/react";
import {useEffect} from "react";
import {useAppDispatch} from "@/store/hooks";
import {clearUser, setSessionLoading, setUser} from "@/store/slices/user-slice";

/**
 * Session 同步组件
 *
 * 【NextAuth 原生架构】
 *
 * 职责单一，只做两件事：
 * 1. ✅ NextAuth session 同步到 Redux store（UI 状态同步）
 * 2. ✅ RefreshTokenError 检测 → 自动登出
 *
 * 【关键修复：初始化时序】
 *
 * NextAuth 初始状态是 loading，不是 unauthenticated。
 * 如果不处理这个状态，页面刚加载时 Redux 会显示未登录，
 * 直到 NextAuth 完成 session 读取（约 50ms）后才更新为已登录，
 * 导致 Navbar Account 图标出现"未登录 → 已登录"的闪烁。
 *
 * 状态流转：
 * ┌──────────┐    ┌───────────────┐    ┌───────────────┐
 * │  LOADING │ →  │ AUTHENTICATED │ OR │ UNAUTHENTICATED │
 * └──────────┘    └───────────────┘    └───────────────┘
 *       ↓                ↓                   ↓
 *   显示 spinner     用户已登录           显示登录按钮
 */
export const SessionSync = () => {
  const {data: session, status} = useSession();
  const dispatch = useAppDispatch();

  // 1. 同步 NextAuth session 状态到 Redux store
  useEffect(() => {
    // 阶段 1: NextAuth 正在读取 session（页面刚刷新时）
    if (status === "loading") {
      dispatch(setSessionLoading(true));
      // ⚠️ 注意：此时不调用 clearUser！
      // 可能用户已登录，只是 session 还在加载中
      return;
    }

    // 阶段 2: NextAuth 加载完成
    dispatch(setSessionLoading(false));

    if (status === "authenticated" && session?.user) {
      // ✅ 用户已登录，同步到 Redux
      // 🛡️ 安全过滤：显式提取 UI 必需字段，不传递敏感 Token
      const {userId, nickname, avatar, email, expiresTime, error} = session.user;
      dispatch(setUser({userId, nickname, avatar, email, expiresTime, error}));
    } else if (status === "unauthenticated") {
      // ❌ 确认未登录，清理 Redux
      dispatch(clearUser());
    }
  }, [session, status, dispatch]);

  // 2. 监听刷新失败标记，自动登出
  useEffect(() => {
    if ((session?.user as any)?.error === "RefreshTokenError") {
      console.warn("[SessionSync] Refresh token expired or invalid, logging out...");
      signOut({callbackUrl: "/customer/login"});
    }
  }, [(session?.user as any)?.error]);

  return null;
};
