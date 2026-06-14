"use client";

import {useSession} from "next-auth/react";

/**
 * 用户认证状态 Hook（NextAuth 原生架构）
 *
 * 【修复说明】
 * 之前的 isGuest 逻辑错误地把 loading 状态也算作访客，导致：
 * 1. 页面刚加载时，已登录用户被误判为访客
 * 2. useCartDetail 等依赖 isGuest 的查询不会执行
 * 3. 购物车不加载，显示空状态
 *
 * 正确逻辑：
 * - isGuest: 只有确认未登录才算访客
 * - isLoading: NextAuth 正在加载 session
 * - isAuthenticated: 确认已登录
 *
 * 【影响范围】被 8 个组件/hook 使用：
 * - AddToCart.tsx, AddToCartButton.tsx
 * - EditItemQuantityButton.tsx, DeleteItemButton.tsx
 * - useCartDetail.ts, useAddToCart.ts
 * - ReviewButton.tsx
 */
export const useAuthStatus = () => {
  const {status} = useSession();

  const isAuthenticated = status === "authenticated";
  // ✅ 修复：只有 unauthenticated 才算访客，loading 时不做判断
  // loading 时 isGuest=false，配合 isLoading 状态可以在 UI 上显示 spinner
  const isGuest = status === "unauthenticated";
  const isLoading = status === "loading";

  return {isAuthenticated, isGuest, isLoading};
};
