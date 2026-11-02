import {DefaultSession, DefaultUser} from 'next-auth';
import {JWT as DefaultJWT} from 'next-auth/jwt';

/**
 * 扩展 NextAuth 类型系统（Token 零暴露架构 ✅）
 *
 * 【最终安全状态】
 * - ✅ accessToken: 仅存在于服务端 JWT 类型，客户端完全不可见
 * - ✅ refreshToken: 仅存在于服务端 JWT 类型，客户端完全不可见
 * - 服务端 API 代理负责在请求时添加 Token，客户端无感知
 *
 * 【类型安全边界】
 * ┌───────────────────────────────────────────────────────────┐
 * │  Client Side Types (User, Session)                        │
 * │  - userId, nickname, avatar, email, ...                    │
 * │  - NO ACCESS TOKENS OF ANY KIND                            │
 * └───────────────────────────────────────────────────────────┘
 *                            │
 *                            ▼  HttpOnly Cookie (encrypted)
 * ┌───────────────────────────────────────────────────────────┐
 * │  Server Side Type (JWT)                                    │
 * │  - accessToken, refreshToken                               │
 * │  - userId, nickname, avatar, email, ...                    │
 * └───────────────────────────────────────────────────────────┘
 */

declare module 'next-auth' {
  /**
   * 客户端 Session 类型（暴露给前端）
   *
   * 🎯 安全保证：不含任何 Token 信息
   */
  interface Session {
    user: User & DefaultSession['user'];
  }

  /**
   * 客户端 User 类型（暴露给前端）
   *
   * 🎯 安全保证：仅包含 UI 渲染必需的字段，无任何 Token
   */
  interface User extends DefaultUser {
    userId: number;
    nickname: string;
    avatar: string;
    email: string;
    point: number;
    experience: number;
    brokerageEnabled: boolean;
    expiresTime: number;
    openid?: string;
    error?: 'RefreshTokenError';
    // ✅ 已永久移除: accessToken（Token 零暴露架构）
    // ✅ 已永久移除: refreshToken（Token 零暴露架构）
  }
}

declare module 'next-auth/jwt' {
  /**
   * 服务端 JWT 类型（仅服务端可访问）
   *
   * 🎯 安全边界：仅在服务端代码中可见，存储在 HttpOnly Cookie 中
   * 客户端代码永远无法访问此类型或其包含的 Token
   */
  interface JWT extends DefaultJWT {
    userId: number;
    nickname: string;
    avatar: string;
    email: string;
    point: number;
    experience: number;
    brokerageEnabled: boolean;
    accessToken: string;      // ✅ 服务端专用，客户端不可见
    refreshToken: string;     // ✅ 服务端专用，客户端不可见
    expiresTime: number;
    openid?: string;
    error?: "RefreshTokenError";
  }
}