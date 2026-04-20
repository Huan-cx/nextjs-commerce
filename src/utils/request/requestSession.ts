// src/utils/request/request.ts
import {GRAPHQL_URL} from "@/utils/constants";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/utils/auth";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = unknown> {
  url: string;
  method?: HttpMethod;
  params?: Record<string, any>;
  data?: TBody;
  headers?: Record<string, string>;
  contentType?: boolean | 'urlencoded';
  requiresAuth?: boolean;
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

  return queryParams.toString();
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
  const {
    url,
    method = "GET",
    params,
    data,
    headers = {},
    contentType = true,
    requiresAuth = true,
  } = options;

  try {
    // 构建请求 URL
    const queryString = params ? buildQueryString(params) : '';
    const requestUrl = `${GRAPHQL_URL}/${url}${queryString ? `?${queryString}` : ''}`;

    // 构建请求头
    const defaultHeaders: Record<string, string> = {
      ...(contentType === true ? {"Content-Type": "application/json"} : {}),
      ...(contentType === 'urlencoded' ? {"Content-Type": "application/x-www-form-urlencoded"} : {}),
      'tenant-id': "1",
      'terminal': "20",
      ...headers,
    };

    // 只在服务端添加认证 Token
    if (requiresAuth) {
      const session = await getServerSession(authOptions);
      if (session?.user?.accessToken) {
        defaultHeaders['Authorization'] = `Bearer ${session.user.accessToken as string}`;
      }
    }

    // 构建请求配置
    const requestConfig: RequestInit = {
      method,
      headers: defaultHeaders,
    };

    // 对于非 GET 请求，添加请求体
    if (method !== "GET" && data) {
      if (contentType === 'urlencoded') {
        const formData = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        requestConfig.body = formData.toString();
      } else {
        requestConfig.body = JSON.stringify(data);
      }
    }

    // 发送请求
    const response = await fetch(requestUrl, requestConfig);

    // 解析响应
    const result = await response.json();

    // 处理错误
    if (!response.ok) {
      throw new Error(result?.msg || `Request failed with status ${response.status}`);
    }

    // 智能返回响应数据
    return (result?.data !== undefined) ? (result.data as T) : (result as T);
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);
    throw error;
  }
}

// 便捷方法
export async function get<T = any>(url: string, params?: Record<string, any>, options?: Partial<RequestOptions>) {
  return request<T>({url, method: "GET", params, ...options});
}

export async function post<T = any>(url: string, data?: any, options?: Partial<RequestOptions>) {
  return request<T>({url, method: "POST", data, ...options});
}

export async function put<T = any>(url: string, data?: any, options?: Partial<RequestOptions>) {
  return request<T>({url, method: "PUT", data, ...options});
}

export async function del<T = any>(url: string, params?: Record<string, any>, options?: Partial<RequestOptions>) {
  return request<T>({url, method: "DELETE", params, ...options});
}