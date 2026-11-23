/**
 * 兼容层 - 统一请求方法（旧代码平滑迁移用）
 *
 * 【迁移指南】
 * 新代码请直接使用：
 * import { get, post } from '@/utils/request/client'  // 客户端
 * import { get, post } from '@/utils/request/server'  // 服务端
 *
 * 这个文件保留给已有调用，建议逐步迁移。
 */

import {REST_URL, TENANT_ID} from "@/utils/constants";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = unknown> {
  url: string;
  method?: HttpMethod;
  params?: Record<string, any>;
  data?: TBody;
  headers?: Record<string, string>;
  contentType?: boolean | "urlencoded";
  requestId?: string;
  /** 是否需要认证（默认 true，仅用于文档说明目的） */
  requiresAuth?: boolean;
}

interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}
// 认证相关路径 - 必须直接调用后端
const AUTH_PATHS = [
  "member/auth/login",
  "member/auth/refresh-token",
  "member/auth/register",
  "member/auth/logout",
  "member/auth/reset-password",
  "member/auth/send-verify-code",
];

function isAuthPath(url: string): boolean {
  return AUTH_PATHS.some(path => url.includes(path));
}

function isServerSide(): boolean {
  return typeof window === "undefined";
}

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
 * 统一请求方法 - 自动判断环境
 *
 * 【推荐】新代码显式导入 client.ts 或 server.ts
 * 这样更清晰、更类型安全
 */
export async function request<T = any>(options: RequestOptions): Promise<T> {
  const {url, method = "GET", params, data, headers = {}, contentType = true} = options;

  const isServer = isServerSide();
  const isAuth = isAuthPath(url);

  // 自动选择正确的请求方式
  if (isServer && !isAuth) {
    // 服务端环境：直接导入 server 模块
    const {serverRequest} = await import('./server');
    return serverRequest<T>(options);
  } else {
    // 客户端或认证接口：使用 client 模块（认证接口不走代理）
    const {clientRequest} = await import('./client');
    if (isAuth) {
      // 认证接口需要特殊处理（不走代理，直接调用后端）
      const queryString = params ? buildQueryString(params) : "";
      const requestUrl = `${REST_URL}/${url}${queryString}`;
      const hasBody = data && method !== "GET";

      const fetchHeaders = new Headers();
      Object.entries(headers).forEach(([k, v]) => fetchHeaders.set(k, v));
      if (contentType === "urlencoded") {
        fetchHeaders.set("Content-Type", "application/x-www-form-urlencoded");
      } else if (contentType) {
        fetchHeaders.set("Content-Type", "application/json");
      }
      fetchHeaders.set("tenant-id", TENANT_ID);
      fetchHeaders.set("terminal", "20");

      const requestConfig: RequestInit = {
        method,
        credentials: "include",
        headers: fetchHeaders,
      };
      if (hasBody) {
        requestConfig.body = contentType === "urlencoded"
            ? new URLSearchParams(data as any).toString()
            : JSON.stringify(data);
      }

      const response = await fetch(requestUrl, requestConfig);
      const result: ApiResponse = await response.json();

      if (result.code === 0) {
        return (result.data !== undefined ? result.data : result) as T;
      }
      throw new Error(result.msg || "Request failed");
    } else {
      return clientRequest<T>(options);
    }
  }
}

// 快捷方法（兼容旧代码）
export async function get<T = any>(
    url: string,
    params?: Record<string, any>,
    options?: Partial<RequestOptions>
): Promise<T> {
  return request<T>({url, method: "GET", params, ...options});
}

export async function post<T = any>(
    url: string,
    data?: any,
    options?: Partial<RequestOptions>
): Promise<T> {
  return request<T>({url, method: "POST", data, ...options});
}

export async function put<T = any>(
    url: string,
    data?: any,
    options?: Partial<RequestOptions>
): Promise<T> {
  return request<T>({url, method: "PUT", data, ...options});
}

export async function patch<T = any>(
    url: string,
    data?: any,
    options?: Partial<RequestOptions>
): Promise<T> {
  return request<T>({url, method: "PATCH", data, ...options});
}

export async function del<T = any>(
    url: string,
    params?: Record<string, any>,
    options?: Partial<RequestOptions>
): Promise<T> {
  return request<T>({url, method: "DELETE", params, ...options});
}
