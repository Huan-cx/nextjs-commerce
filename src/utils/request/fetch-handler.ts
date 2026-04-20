// src/utils/fetch-handler.ts
import {getSession} from 'next-auth/react';

export interface FetchOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

export async function fetchHandler<T = any>(options: FetchOptions): Promise<T> {
  const {url, method = 'GET', body, headers = {}} = options;

  try {
    // 获取 session
    const session = await getSession();

    // 构建请求头
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // 添加认证 token
    if (session?.user?.accessToken) {
      requestHeaders['Authorization'] = `Bearer ${session.user.accessToken}`;
    }

    // 发送请求到 Next.js API 路由
    const response = await fetch(`/api${url}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // 处理响应
    if (!response.ok) {
      const error = await response.json();

      // 处理 401 错误（token 过期）
      if (response.status === 401) {
        // NextAuth 会自动处理 token 刷新
        // 这里可以触发重新登录或刷新页面
        throw new Error('Session expired. Please login again.');
      }

      throw new Error(error.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// 便捷方法
export const api = {
  get: <T = any>(url: string) => fetchHandler<T>({url, method: 'GET'}),
  post: <T = any>(url: string, body: any) => fetchHandler<T>({url, method: 'POST', body}),
  put: <T = any>(url: string, body: any) => fetchHandler<T>({url, method: 'PUT', body}),
  delete: <T = any>(url: string) => fetchHandler<T>({url, method: 'DELETE'}),
};
