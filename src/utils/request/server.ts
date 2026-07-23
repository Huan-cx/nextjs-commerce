/**
 * 服务端请求封装 - Next.js/NextAuth 标准实现
 *
 * 【使用场景】
 * - Server Components
 * - Server Actions
 * - Middleware
 * - API Routes（非 Proxy 场景）
 *
 * 【核心原则】
 * 直接调用后端 API，不走本地代理
 * 使用 getToken() 从 Cookie 解密 JWT，手动附加 Authorization
 *
 * 【与客户端的区别】
 * ✅ 没有 `/api/proxy` 代理层
 * ✅ 手动调用 getToken() 获取 JWT
 * ✅ 手动附加 Authorization Header
 */

import {NEXTAUTH_SECURE_TOKEN, NEXTAUTH_TOKEN, REST_URL, TENANT_ID} from "@/utils/constants";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = unknown> {
  url: string;
  method?: HttpMethod;
  params?: Record<string, any>;
  data?: TBody;
  headers?: Record<string, string>;
  contentType?: boolean | "urlencoded";
  /** 用于幂等性的请求 ID，不传则自动生成 */
  requestId?: string;
  /** 是否需要认证（默认 true，仅用于文档说明目的） */
  requiresAuth?: boolean;
}

interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 从 Cookie 中解析 NextAuth JWT Token（服务端专用）
 *
 * 【为什么需要这个函数】
 * NextAuth 在 HTTPS 环境下会自动启用 useSecureCookies，
 * Cookie 名变为 `__Secure-next-auth.session-token`；
 * HTTP 环境下则是 `next-auth.session-token`。
 *
 * 在 SSR/Middleware 中手动构造 req 对象调用 getToken 时，
 * NextAuth 无法自动判断协议，必须显式指定 cookieName，
 * 否则在 HTTPS 生产环境会拿不到 token（返回 null）。
 *
 * 这里根据 NEXTAUTH_URL 协议动态选择 cookieName。
 */
export async function getAuthTokenFromCookies(cookieStore: any) {
  const {getToken} = await import("next-auth/jwt");

  // 根据 NEXTAUTH_URL 协议动态选择 cookieName
  // HTTPS: __Secure-next-auth.session-token
  // HTTP:  next-auth.session-token
  const isSecureCookie = (process.env.NEXTAUTH_URL ?? "").startsWith("https");
  const cookieName = isSecureCookie ? NEXTAUTH_SECURE_TOKEN : NEXTAUTH_TOKEN;

  const cookieHeader = cookieStore
      .getAll()
      .map((c: any) => `${c.name}=${c.value}`)
      .join("; ");

  return getToken({
    req: {
      cookies: Object.fromEntries(
          cookieStore.getAll().map((c: any) => [c.name, c.value])
      ),
      headers: {cookie: cookieHeader},
    } as any,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName,
  });
}

/**
 * 构建查询字符串
 */
function buildQueryString(params: Record<string, any>): string {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * 构建请求头（服务端版本）
 *
 * 包含从 JWT 解密的 accessToken
 *
 * 【重要】服务端专用 API 在函数内部动态导入
 * 避免被客户端代码打包时报错
 */
async function buildHeaders(
    contentType: boolean | "urlencoded",
    customHeaders: Record<string, string> = {},
    requestId?: string,
    customAccessToken?: string
): Promise<Headers> {
  const headers = new Headers();

  Object.entries(customHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  if (contentType === "urlencoded") {
    headers.set("Content-Type", "application/x-www-form-urlencoded");
  } else if (contentType) {
    headers.set("Content-Type", "application/json");
  }

  if (requestId) {
    headers.set("X-Request-Id", requestId);
  }

  // 租户标识（所有请求都需要）
  headers.set("tenant-id", TENANT_ID);

  // 终端类型（所有请求都需要）
  headers.set("terminal", "20");

  // ✅ 使用传入的 customAccessToken，否则从 token 中获取
  if (customAccessToken) {
    headers.set("Authorization", `Bearer ${customAccessToken}`);
  } else {
    // ✅ 用 getToken() 获取 accessToken
    // getServerSession() 返回的 session 没有 accessToken（被 session callback 过滤了）
    try {
      const {cookies} = await import("next/headers");

      // 尝试获取 cookieStore，如果失败（如在 generateStaticParams 中）则跳过
      let cookieStore;
      try {
        cookieStore = await cookies();
      } catch (_contextError) {
        // 在非请求上下文中（如 generateStaticParams），cookies() 会抛出错误
        console.warn("[Server Request] No request context available, skipping token retrieval");
        return headers;
      }

      const token = await getAuthTokenFromCookies(cookieStore);
      console.warn("[Server Request] Token ----------------:", token);

      if (token?.accessToken) {
        headers.set("Authorization", `Bearer ${token.accessToken}`);
      }
    } catch (error) {
      // 无法获取 Token 时静默失败，由后端返回 401
      console.warn("[Server Request] Failed to get token:", error);
    }
  }

  return headers;
}

/**
 * 服务端统一请求方法
 *
 * 【Token 零暴露架构】
 * Token 仅在服务端内存中，永远不会发送到客户端浏览器
 */
export async function serverRequest<T = any>(
    options: RequestOptions,
    retryCount: number = 0,
    customAccessToken?: string
): Promise<T> {
  const {
    url,
    method = "GET",
    params,
    data,
    headers = {},
    contentType = true,
    requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
  } = options;

  const queryString = params ? buildQueryString(params) : "";
  const requestUrl = `${REST_URL}/${url}${queryString}`;

  const hasBody = data && method !== "GET";

  const fetchHeaders = await buildHeaders(contentType, headers, requestId, customAccessToken);

  const baseRequestConfig: RequestInit = {
    method,
    headers: fetchHeaders,
    cache: "no-store", // 默认不缓存，需要缓存的请求使用 cachedRestGet / unstable_cache
  };

  if (hasBody) {
    baseRequestConfig.body = contentType === "urlencoded"
        ? new URLSearchParams(data as any).toString()
        : JSON.stringify(data);
  }

  console.info(`[Server Request] 🚀 ${method} ${requestUrl}`);

  const response = await fetch(requestUrl, baseRequestConfig);

  const result: ApiResponse = await response.json();

  if (result.code === 0) {
    return (result.data !== undefined ? result.data : result) as T;
  }

  // 🔄 处理 401 错误：尝试刷新 token 并重试（最多重试一次）
  if (result.code === 401 && retryCount === 0) {
    console.warn("[Server Request] 401 Unauthorized - attempting token refresh");

    try {
      // 调用 refreshAccessToken 刷新 token
      const {refreshAccessToken} = await import("@utils/api/auth");
      const {cookies} = await import("next/headers");

      // 尝试获取 cookieStore，如果失败（如在 generateStaticParams 中）则跳过
      let cookieStore;
      try {
        cookieStore = await cookies();
      } catch (_contextError) {
        console.warn("[Server Request] No request context available for token refresh");
        throw new Error(result.msg || "Request failed");
      }

      const token = await getAuthTokenFromCookies(cookieStore);

      if (token?.refreshToken) {
        const refreshResult = await refreshAccessToken(token.refreshToken as string);
        console.warn("[Server Request] Token refreshed successfully, retrying request");

        // 使用新获取的 accessToken 重试请求
        if (refreshResult?.accessToken) {
          return serverRequest<T>(options, retryCount + 1, refreshResult.accessToken);
        }
      }
    } catch (refreshError) {
      console.error("[Server Request] Token refresh failed:", refreshError);
    }
  }

  throw new Error(result.msg || "Request failed");
}

// 快捷方法
export async function get<T = any>(
    url: string,
    params?: Record<string, any>,
    options?: Partial<RequestOptions>
): Promise<T> {
  return serverRequest<T>({url, method: "GET", params, ...options});
}

export async function post<T = any>(
    url: string,
    data?: any,
    options?: Partial<RequestOptions>
): Promise<T> {
  return serverRequest<T>({url, method: "POST", data, ...options});
}

export async function put<T = any>(
    url: string,
    data?: any,
    options?: Partial<RequestOptions>
): Promise<T> {
  return serverRequest<T>({url, method: "PUT", data, ...options});
}

export async function patch<T = any>(
    url: string,
    data?: any,
    options?: Partial<RequestOptions>
): Promise<T> {
  return serverRequest<T>({url, method: "PATCH", data, ...options});
}

export async function del<T = any>(
    url: string,
    params?: Record<string, any>,
    options?: Partial<RequestOptions>
): Promise<T> {
  return serverRequest<T>({url, method: "DELETE", params, ...options});
}