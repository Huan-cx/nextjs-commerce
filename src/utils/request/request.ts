import {GRAPHQL_URL} from "@/utils/constants";
import {getSession, signOut} from "next-auth/react";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = unknown> {
  url: string;           // API 端点，例如 "product/spu/page"
  method?: HttpMethod;   // HTTP 方法，默认为 GET
  params?: Record<string, any>;  // 查询参数（用于 GET 请求）
  data?: TBody;         // 请求体（用于 POST、PUT 等请求）
  headers?: Record<string, string>;  // 自定义请求头
  contentType?: boolean | 'urlencoded';  // 是否设置 Content-Type，或使用 urlencoded
  requiresAuth?: boolean; // 是否需要认证 Token，默认为 true
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

/**
 * 通用 HTTP 请求工具
 * @param options 请求选项
 * @returns 响应数据
 */
export async function request<T = any>(options: RequestOptions): Promise<T> {
  const {
    url,
    method = "GET",
    params,
    data,
    headers = {},
    contentType = true,
    requiresAuth = false,
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

    // 自动添加认证 Token
    if (requiresAuth) {
      const session = await getSession();
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
        // 处理 application/x-www-form-urlencoded 格式
        const formData = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        requestConfig.body = formData.toString();
      } else {
        // 处理 application/json 格式
        requestConfig.body = JSON.stringify(data);
      }
    }

    // 发送请求
    const response = await fetch(requestUrl, requestConfig);

    // 解析响应
    const result = await response.json();

    // 处理错误
    if (result.code !== 0) {
      // 处理认证错误
      if (response.status === 401 && requiresAuth) {
        console.log('收到 401 错误，尝试刷新 token');

        // 直接调用刷新 token 的 API
        try {
          const session = await getSession();
          if (session?.user?.refreshToken) {
            console.log('使用 refreshToken 刷新 token:', session.user.refreshToken);

            // 调用刷新 token 的 API
            const {refreshAccessToken} = await import('@utils/api/auth');
            const newToken = await refreshAccessToken(session.user.refreshToken);

            console.log('Token 刷新成功:', newToken);

            // 更新 session 中的 token
            // 注意：这里需要使用 NextAuth 的 update() 方法，但这个方法在客户端不可用
            // 所以我们只能重新发送请求，使用新的 token

            // 重新构建请求头，使用新的 token
            const newHeaders = {
              ...headers,
              'Authorization': `Bearer ${newToken.accessToken}`,
            };

            // 重新发送请求
            const retryResponse = await fetch(requestUrl, {
              ...requestConfig,
              headers: newHeaders,
            });

            const retryResult = await retryResponse.json();

            if (retryResult.code === 0) {
              console.log('重试请求成功');
              return (retryResult?.data !== undefined) ? (retryResult.data as T) : (retryResult as T);
            } else {
              throw new Error(retryResult?.msg || 'Token refresh failed');
            }
          } else {
            console.log('没有 refreshToken，跳转到登录页');
            await signOut({callbackUrl: '/login'});
          }
        } catch (refreshError) {
          console.error('Token 刷新失败:', refreshError);
          await signOut({callbackUrl: '/login'});
        }

        throw new Error(result?.msg || `Request failed with status ${response.status}`);
      }
    }

    // 智能返回响应数据
    return (result?.data !== undefined) ? (result.data as T) : (result as T);
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);
    throw error;
  }
}

/**
 * 便捷方法：发送 GET 请求
 */
export async function get<T = any>(url: string, params?: Record<string, any>, options?: Partial<RequestOptions>) {
  return request<T>({
    url,
    method: "GET",
    params,
    ...options,
  });
}

/**
 * 便捷方法：发送 POST 请求
 */
export async function post<T = any>(url: string, data?: any, options?: Partial<RequestOptions>) {
  return request<T>({
    url,
    method: "POST",
    data,
    ...options,
  });
}

/**
 * 便捷方法：发送 PUT 请求
 */
export async function put<T = any>(url: string, data?: any, options?: Partial<RequestOptions>) {
  return request<T>({
    url,
    method: "PUT",
    data,
    ...options,
  });
}

/**
 * 便捷方法：发送 DELETE 请求
 */
export async function del<T = any>(url: string, params?: Record<string, any>, options?: Partial<RequestOptions>) {
  return request<T>({
    url,
    method: "DELETE",
    params,
    ...options,
  });
}