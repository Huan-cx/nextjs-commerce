/**
 * 请求统一入口 - Next.js/NextAuth 标准架构
 *
 * 【架构说明】
 *
 * ┌───────────────────────────────────────────────────────────────────┐
 * │                            客户端请求                                │
 * ├───────────────────────────────────────────────────────────────────┤
 * │ 客户端组件 / useCart() / 等                                        │
 * │   ↓                                                                 │
 * │ fetch('/api/proxy/trade/cart/list')                                │
 * │   ↓                                                                 │
 * │ API Route Handler (/api/proxy/[...path]/route.ts)                 │
 * │   ↓ getToken() 解密 JWT                                            │
 * │ 附加 Authorization Header                                           │
 * │   ↓                                                                 │
 * │ 转发到后端 API                                                      │
 * └───────────────────────────────────────────────────────────────────┘
 *
 * ┌───────────────────────────────────────────────────────────────────┐
 * │                            服务端请求                                │
 * ├───────────────────────────────────────────────────────────────────┤
 * │ Server Component / Server Action / etc.                            │
 * │   ↓                                                                 │
 * │ 直接 fetch(REST_URL + '/trade/cart/list')                          │
 * │   ↓ getToken() 解密 JWT                                            │
 * │ 附加 Authorization Header                                           │
 * │   ↓                                                                 │
 * │ 直接请求后端 API                                                    │
 * └───────────────────────────────────────────────────────────────────┘
 *
 * 【Token 零暴露】
 * ✅ 客户端代码中没有任何 Token 相关逻辑
 * ✅ Token 仅在服务端内存中传递
 * ✅ 浏览器只能看到加密的 HttpOnly Cookie
 *
 * 【使用方式】
 * import { get, post } from '@/utils/request/client'  // 客户端
 * import { get, post } from '@/utils/request/server'  // 服务端
 */

// 导出两个版本供显式导入（推荐）
export * as client from './client';
export * as server from './server';
