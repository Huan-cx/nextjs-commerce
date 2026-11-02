import NextAuth, {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {login, refreshAccessToken} from "@utils/api/auth";
import {JWT} from "next-auth/jwt";

/**
 * 将后端返回的时间格式转换为毫秒级时间戳
 * @param expiresTime 后端返回的时间字符串或数字
 * @returns 毫秒级时间戳
 */
export function parseExpiresTime(expiresTime: string | number | undefined): number {
  if (typeof expiresTime === "number") {
    return expiresTime;
  }
  if (typeof expiresTime === "string") {
    const parsed = new Date(expiresTime).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * 判断 token 是否需要刷新
 * @param token JWT token
 * @param bufferMs 提前刷新缓冲时间（毫秒），默认 5 分钟
 * @returns true 表示需要刷新
 */
function shouldRefreshToken(token: JWT, bufferMs: number = 5 * 60 * 1000): boolean {
  if (!token.expiresTime) {
    return false;
  }
  // 当前时间 >= 过期时间 - 缓冲时间，说明需要刷新
  return Date.now() >= (token.expiresTime as number) - bufferMs;
}

// 【P1 优化】刷新冷却机制 - 防止重复刷新
// 场景：request.ts 检测到 401 触发 update()，同时 jwt callback 检测到过期自动刷新
// 最坏情况：两个刷新同时发起，浪费 refresh token
let _lastRefreshTimestamp = 0;
const REFRESH_COOLDOWN_MS = 3000;  // 3 秒冷却期

/**
 * 判断是否应该跳过刷新（冷却机制）
 * 仅当冷却期内才跳过，避免重复刷新
 */
function shouldSkipRefreshCooldown(): boolean {
  const now = Date.now();
  const timeSinceLastRefresh = now - _lastRefreshTimestamp;
  return timeSinceLastRefresh < REFRESH_COOLDOWN_MS;
}

/**
 * 执行实际的 token 刷新操作
 * 统一管理刷新逻辑，避免代码重复
 */
async function doRefreshToken(token: JWT, triggerType: "manual" | "auto"): Promise<JWT> {
  // 先记录刷新时间戳，避免并发
  _lastRefreshTimestamp = Date.now();

  try {
    // 【安全审计】记录 Token 刷新事件
    // 生产环境应将此日志发送到后端安全审计系统
    const auditLog = {
      event: "TOKEN_REFRESH",
      timestamp: new Date().toISOString(),
      userId: token.userId,
      triggerType,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "server-side",
    };
    console.warn(`[Security Audit] ${JSON.stringify(auditLog)}`);
    console.warn(`[NextAuth] Refreshing token (trigger: ${triggerType}, userId: ${token.userId})`);

    if (!token.refreshToken) {
      const errorLog = {
        event: "TOKEN_REFRESH_FAILED",
        timestamp: new Date().toISOString(),
        userId: token.userId,
        reason: "NO_REFRESH_TOKEN",
      };
      console.error(`[Security Audit] ${JSON.stringify(errorLog)}`);
      return {...token, error: "RefreshTokenError" as const};
    }

    const newToken = await refreshAccessToken(token.refreshToken as string);

    const successLog = {
      event: "TOKEN_REFRESH_SUCCESS",
      timestamp: new Date().toISOString(),
      userId: token.userId,
      triggerType,
    };
    console.warn(`[Security Audit] ${JSON.stringify(successLog)}`);

    return {
      ...token,
      accessToken: newToken.accessToken,
      refreshToken: newToken.refreshToken || token.refreshToken,
      expiresTime: parseExpiresTime(newToken.expiresTime as string | number),
      error: undefined,
    };
  } catch (error) {
    const errorLog = {
      event: "TOKEN_REFRESH_FAILED",
      timestamp: new Date().toISOString(),
      userId: token.userId,
      triggerType,
      reason: error instanceof Error ? error.message : "unknown",
    };
    console.error(`[Security Audit] ${JSON.stringify(errorLog)}`);
    console.error(`[NextAuth] Token refresh failed (trigger: ${triggerType}):`, error);
    return {...token, error: "RefreshTokenError" as const};
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    // Session 有效期设置为 12 小时，降低 Token 泄露风险
    maxAge: 12 * 60 * 60,
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {label: "Email", type: "text"},
        password: {label: "Password", type: "password"},
      },

      authorize: async (credentials): Promise<any> => {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const response = await login({
          loginAccount: credentials.username,
          password: credentials.password,
        });

        return {
          ...response,
          id: response.userId?.toString(),
          expiresTime: parseExpiresTime(response.expiresTime),
        };
      },
    }),
  ],

  callbacks: {
    /**
     * JWT Callback - NextAuth 核心 token 管理
     *
     * 【核心逻辑】
     * 1. user 存在时：登录成功，初始化 token 信息
     * 2. trigger === "update" 时：主动触发刷新（如 request.ts 中调用 update()
     * 3. token 即将过期时：自动刷新
     * 4. 刷新失败时：标记 RefreshTokenError，由前端处理登出
     *
     * 【P1 优化】增加刷新冷却机制
     * 避免自动检测过期 + request.ts 手动触发 同时刷新导致重复请求
     */
    async jwt({token, user, trigger}) {
      // 情况 1: 首次登录，初始化 token
      if (user) {
        // 类型断言：自定义 User 类型扩展字段
        const extendedUser = user as unknown as {
          accessToken: string;
          refreshToken: string;
          expiresTime: number;
          userId: number;
          nickname: string;
          avatar: string;
          email: string;
          point: number;
          experience: number;
          brokerageEnabled: boolean;
        };
        return {
          ...token,
          accessToken: extendedUser.accessToken,
          refreshToken: extendedUser.refreshToken,
          expiresTime: extendedUser.expiresTime,
          userId: extendedUser.userId,
          nickname: extendedUser.nickname,
          avatar: extendedUser.avatar,
          email: extendedUser.email,
          point: extendedUser.point,
          experience: extendedUser.experience,
          brokerageEnabled: extendedUser.brokerageEnabled,
        } as import("next-auth/jwt").JWT;
      }

      // 情况 2: 主动触发刷新（request.ts 中调用 update(undefined) 或 update({refresh: true}
      if (trigger === "update") {
        // 检查冷却：3 秒内不重复刷新
        // 解决：jwt callback 自动检测过期 与 request.ts 手动触发 撞车问题
        if (shouldSkipRefreshCooldown()) {
          console.warn("[NextAuth] Skip refresh due to cooldown (already refreshed recently)");
          return token;
        }

        return await doRefreshToken(token, "manual");
      }

      // 情况 3: 自动检测过期，自动刷新（避免下次请求时才发现过期
      if (shouldRefreshToken(token)) {
        // 检查冷却：3 秒内不重复刷新
        // 解决：多个并发 getSession() 都触发自动刷新的问题
        if (shouldSkipRefreshCooldown()) {
          console.warn("[NextAuth] Skip auto refresh due to cooldown");
          return token;
        }

        return await doRefreshToken(token, "auto");
      }

      // 情况 4: token 仍有效，直接返回
      return token;
    },

    /**
     * Session Callback - NextAuth 社区标准实现
     *
     * 【Token 零暴露架构 ✅】
     *
     * API Proxy 不依赖这个 callback！
     * - 🔐 API Proxy 使用 getToken() 直接解密 JWT（NextAuth 标准做法）
     * - 🌐 这里只处理客户端 useSession() 需要的数据
     *
     * 职责单一，只做一件事：
     * - 从 JWT 提取 UI 渲染必需的用户信息
     * - accessToken/refreshToken 永不暴露到客户端
     */
    async session({ session, token }) {
      if (session.user) {
        session.user = {
          ...session.user,
          userId: token.userId,
          nickname: token.nickname,
          avatar: token.avatar,
          email: token.email,
          point: token.point,
          experience: token.experience,
          brokerageEnabled: token.brokerageEnabled,
          expiresTime: token.expiresTime,
          openid: token.openid,
          error: token.error,
        };
      }
      return session;
    },
  },

  pages: {
    signIn: "/customer/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export const handler = NextAuth(authOptions);