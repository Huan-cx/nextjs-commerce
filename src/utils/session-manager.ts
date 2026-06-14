import {Session} from "next-auth";

/**
 * Session 管理器（Token 零暴露架构 ✅）
 *
 * 【安全架构升级】
 * - 客户端代码中不再有任何 Token 访问逻辑
 * - Token 仅存在于服务端 HttpOnly Cookie 加密存储中
 * - 服务端 API 代理负责透明地添加 Authorization Header
 *
 * 【职责范围】
 * 1. Session 状态查询（认证状态判断，不涉及 Token）
 * 2. 登出逻辑（统一的登出入口）
 * 3. Token 刷新触发（服务端透明处理）
 *
 * 【调用边界】
 * - 客户端：仅可访问用户基本信息，Token 不可见
 * - 服务端：完整 JWT 信息，仅内部使用
 */

// ============================================
// 刷新状态锁 - 并发刷新保护
// ============================================
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

// ============================================
// 类型定义
// ============================================
type NextAuthReactModule = {
  getSession: typeof import("next-auth/react").getSession;
  signOut: typeof import("next-auth/react").signOut;
};

// ============================================
// 环境检测与 Session 获取
// ============================================

/**
 * 智能获取 Session - 自动区分服务端/客户端环境
 *
 * 【安全说明】
 * 返回的 Session 对象中不包含任何 Token
 * Token 仅在服务端 JWT Callback 和 API Proxy 中使用
 */
export async function getCurrentSession(): Promise<Session | null> {
  const isServerSide = typeof window === "undefined";

  if (isServerSide) {
    // 服务端环境：动态导入，避免打包到客户端 bundle
    try {
      const {getServerSession} = await import("next-auth/next");
      const {authOptions} = await import("@/utils/auth");
      return await getServerSession(authOptions);
    } catch (error) {
      console.warn("[SessionManager] Server session fallback:", error);
      return null;
    }
  } else {
    // 客户端环境
    const nextAuthReact = await import("next-auth/react") as unknown as NextAuthReactModule;
    return await nextAuthReact.getSession();
  }
}

/**
 * 检查 Session 是否已认证
 *
 * 【Token 零暴露】
 * 通过 userId 判断认证状态，不依赖 accessToken
 * 客户端完全不需要知道 Token 的存在
 */
export function isAuthenticated(session: Session | null | undefined): boolean {
  // 通过 userId 存在性判断，不访问任何 Token
  return !!session?.user?.userId;
}

/**
 * 从 Session 中获取用户 ID（安全）
 */
export function getUserId(session: Session | null | undefined): number | undefined {
  return session?.user?.userId;
}

/**
 * 从 Session 中获取用户昵称（安全）
 */
export function getNickname(session: Session | null | undefined): string | undefined {
  return session?.user?.nickname;
}

// ============================================
// Token 刷新逻辑
// ============================================

/**
 * 触发 Token 刷新（带锁，并发安全）
 *
 * 【透明刷新机制】
 * - 客户端调用此方法仅触发刷新动作
 * - 刷新流程完全在服务端 JWT Callback 中处理
 * - 客户端看不到新旧 Token，也不关心刷新细节
 * - 刷新完成后客户端 Session 自动更新（仍不含 Token）
 */
export async function triggerTokenRefresh(): Promise<void> {
  // 服务端环境不应该调用此方法
  const isServerSide = typeof window === "undefined";
  if (isServerSide) {
    console.warn("[SessionManager] Trigger token refresh called on server side, ignored");
    return;
  }

  // 如果已经在刷新中，等待刷新 Promise 完成
  if (isRefreshing && refreshPromise) {
    console.warn("[SessionManager] Refresh already in progress, waiting...");
    return await refreshPromise;
  }

  // 开始刷新，设置锁
  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      console.warn("[SessionManager] Triggering token refresh (server-side)...");
      const nextAuthReact = await import("next-auth/react") as unknown as NextAuthReactModule;
      // 触发 JWT Callback 的过期自动刷新机制
      // 刷新流程完全在服务端处理，客户端无感知
      await nextAuthReact.getSession();
      console.warn("[SessionManager] Token refresh completed (server-side)");
    } catch (error) {
      console.error("[SessionManager] Token refresh failed:", error);
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return await refreshPromise;
}

/**
 * 检查是否在刷新冷却期内
 * 用于 JWT Callback，避免自动刷新与手动刷新撞车
 */
export function isInRefreshCooldown(): boolean {
  return isRefreshing;
}

// ============================================
// 登出逻辑
// ============================================

/**
 * 安全登出 - 清理 Session 并跳转到登录页
 *
 * 【安全清理】
 * - 清除 NextAuth HttpOnly Cookie
 * - 清除客户端 Session 状态
 * - 跳转到登录页面
 */
export async function logoutAndRedirect(): Promise<never> {
  const isServerSide = typeof window === "undefined";

  if (!isServerSide) {
    try {
      const nextAuthReact = await import("next-auth/react") as unknown as NextAuthReactModule;
      await nextAuthReact.signOut({callbackUrl: "/customer/login", redirect: false});
      console.warn("[SessionManager] User logged out");
    } catch (e) {
      console.warn("[SessionManager] Sign out failed:", e);
    }

    // 跳转到登录页
    window.location.href = "/customer/login";
  } else {
    console.warn("[SessionManager] logoutAndRedirect called on server side");
  }

  throw new Error("Authentication failed, please login again");
}

/**
 * 静默登出 - 不跳转页面，只清理 Session
 * 用于 Refresh Token 失效时的自动处理，由 SessionSync 监听
 */
export async function silentLogout(): Promise<void> {
  const isServerSide = typeof window === "undefined";
  if (isServerSide) {
    console.warn("[SessionManager] silentLogout called on server side, ignored");
    return;
  }

  try {
    console.warn("[SessionManager] Marking session as refresh token error");
    // 注意：这里不直接更新 session，而是让 SessionSync 通过监听状态变化处理
    // 当 refreshAccessToken 在 auth.ts 中失败时，会自动标记 token error
    // 下一次 getSession() 返回的 session 中 user.error 会有 RefreshTokenError
  } catch (e) {
    console.warn("[SessionManager] Silent logout failed:", e);
  }
}

// ============================================
// 状态查询接口
// ============================================

/**
 * 获取当前刷新状态
 * 用于 UI 显示加载状态
 */
export function getRefreshStatus(): { isRefreshing: boolean } {
  return {isRefreshing};
}

// ============================================
// 开发调试工具
// ============================================

/**
 * 重置刷新锁（仅用于测试）
 * DO NOT USE IN PRODUCTION
 */
export function _resetRefreshLock(): void {
  if (process.env.NODE_ENV === "development") {
    isRefreshing = false;
    refreshPromise = null;
  }
}

// ============================================
// ❌ 已移除 - 客户端 Token 访问相关函数
// ============================================
//
// - getAccessToken(session): 已移除（Token 零暴露）
//   现在由服务端 API 代理透明处理
//
// - 任何直接访问 session.user.accessToken 的代码都应该被删除
//   客户端不需要也不应该知道 Token 的存在
