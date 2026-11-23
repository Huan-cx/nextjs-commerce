/**
 * 客户端请求封装 - Next.js/NextAuth 标准实现
 *
 * 【核心原则】
 * 所有业务请求走 `/api/proxy` 本地代理
 * Token 零暴露：客户端完全不接触 accessToken
 *
 * 【请求流程】
 * 客户端 fetch → /api/proxy/xxx (Route Handler) → getToken() → 附加 Authorization → 后端
 *
 * 【安全】
 * ✅ 客户端代码中没有任何 Token 相关逻辑
 * ✅ Token 仅在服务端内存中传递
 */

import {TENANT_ID} from "@/utils/constants";

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

// 代理基础路径（客户端所有业务请求都走这里）
const PROXY_BASE_PATH = "/api/proxy";

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
 * 构建请求头
 *
 * 【注意】客户端不添加 Authorization Header！
 * Token 由服务端 API Proxy 透明附加
 */
function buildHeaders(
    contentType: boolean | "urlencoded",
    customHeaders: Record<string, string> = {},
    requestId?: string
): Headers {
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

  return headers;
}

/**
 * 客户端统一请求方法
 *
 * 【Token 零暴露架构】
 * 所有业务请求通过 API Proxy 转发，
 * Token 附加逻辑完全在服务端，客户端不可见
 */
export async function clientRequest<T = any>(options: RequestOptions): Promise<T> {
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
  const requestUrl = `${PROXY_BASE_PATH}/${url}${queryString}`;

  const hasBody = data && method !== "GET";

  const fetchHeaders = buildHeaders(contentType, headers, requestId);

  const baseRequestConfig: RequestInit = {
    method,
    credentials: "include", // 重要！发送 NextAuth Session Cookie
    headers: fetchHeaders,
  };

  if (hasBody) {
    baseRequestConfig.body = contentType === "urlencoded"
        ? new URLSearchParams(data as any).toString()
        : JSON.stringify(data);
  }

  console.warn(`[Client Request] 🚀 ${method} ${requestUrl}`);

  const response = await fetch(requestUrl, baseRequestConfig);

  const result: ApiResponse = await response.json();

  if (result.code === 0) {
    return (result.data !== undefined ? result.data : result) as T;
  }

  throw new Error(result.msg || "Request failed");
}

// 快捷方法
export async function get<T = any>(
    url: string,
    params?: Record<string, any>,
    options?: Partial<RequestOptions>
): Promise<T> {
  return clientRequest<T>({url, method: "GET", params, ...options});
}

export async function post<T = any>(
    url: string,
    data?: any,
    options?: Partial<RequestOptions>
): Promise<T> {
  return clientRequest<T>({url, method: "POST", data, ...options});
}

export async function put<T = any>(
    url: string,
    data?: any,
    options?: Partial<RequestOptions>
): Promise<T> {
  return clientRequest<T>({url, method: "PUT", data, ...options});
}

export async function patch<T = any>(
    url: string,
    data?: any,
    options?: Partial<RequestOptions>
): Promise<T> {
  return clientRequest<T>({url, method: "PATCH", data, ...options});
}

export async function del<T = any>(
    url: string,
    params?: Record<string, any>,
    options?: Partial<RequestOptions>
): Promise<T> {
  return clientRequest<T>({url, method: "DELETE", params, ...options});
}