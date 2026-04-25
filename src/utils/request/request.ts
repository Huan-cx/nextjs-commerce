import {GRAPHQL_URL} from "@/utils/constants";
import {signOut} from "next-auth/react";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/utils/auth";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const MAX_RETRY_COUNT = 1;
const RETRY_DELAY = 100;
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

async function getAuthSession() {
  if (typeof window === 'undefined') {
    return await getServerSession(authOptions);
  } else {
    const {getSession} = await import("next-auth/react");
    return await getSession();
  }
}

export interface RequestOptions<TBody = unknown> {
  url: string;
  method?: HttpMethod;
  params?: Record<string, any>;
  data?: TBody;
  headers?: Record<string, string>;
  contentType?: boolean | 'urlencoded';
  requiresAuth?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

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
    requiresAuth = false,
    retryCount = 0,
    maxRetries = MAX_RETRY_COUNT,
  } = options;

  try {
    const queryString = params ? buildQueryString(params) : '';
    const requestUrl = `${GRAPHQL_URL}/${url}${queryString ? `?${queryString}` : ''}`;

    const defaultHeaders: Record<string, string> = {
      ...(contentType === true ? {"Content-Type": "application/json"} : {}),
      ...(contentType === 'urlencoded' ? {"Content-Type": "application/x-www-form-urlencoded"} : {}),
      'tenant-id': "1",
      'terminal': "20",
      ...headers,
    };

    if (requiresAuth) {
      const session = await getAuthSession();
      if (session?.user?.accessToken) {
        defaultHeaders['Authorization'] = `Bearer ${session.user.accessToken as string}`;
      }
    }

    const requestConfig: RequestInit = {
      method,
      headers: defaultHeaders,
    };

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

    const response = await fetch(requestUrl, requestConfig);
    const result = await response.json();

    if (result.code !== 0) {
      if (response.status === 401 && requiresAuth && retryCount < maxRetries) {
        if (isRefreshing) {
          console.warn(`Waiting for concurrent token refresh...`);
          return await request<T>({...options, retryCount: retryCount + 1});
        }

        try {
          isRefreshing = true;
          refreshPromise = (async () => {
            console.warn(`Refreshing token (attempt ${retryCount + 1}/${maxRetries})...`);

            const session = await getAuthSession();
            if (session?.user?.refreshToken) {
              const {refreshAccessToken} = await import('@utils/api/auth');
              const newToken = await refreshAccessToken(session.user.refreshToken);

              const newHeaders = {
                ...headers,
                'Authorization': `Bearer ${newToken.accessToken}`,
              };

              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

              const retryResponse = await fetch(requestUrl, {
                ...requestConfig,
                headers: newHeaders,
              });

              const retryResult = await retryResponse.json();

              if (retryResult.code === 0) {
                return (retryResult?.data !== undefined) ? (retryResult.data as T) : (retryResult as T);
              } else {
                throw new Error(retryResult?.msg || 'Token refresh failed');
              }
            } else {
              await signOut({callbackUrl: '/login'});
              throw new Error('No refresh token available');
            }
          })();

          return await refreshPromise;
        } catch (refreshError) {
          console.error('Token 刷新失败:', refreshError);
          await signOut({callbackUrl: '/login'});
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      }

      throw new Error(result?.msg || `Request failed with status ${response.status}`);
    }

    return (result?.data !== undefined) ? (result.data as T) : (result as T);
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);
    throw error;
  }
}

export async function get<T = any>(url: string, params?: Record<string, any>, options?: Partial<RequestOptions>) {
  return request<T>({
    url,
    method: "GET",
    params,
    ...options,
  });
}

export async function post<T = any>(url: string, data?: any, options?: Partial<RequestOptions>) {
  return request<T>({
    url,
    method: "POST",
    data,
    ...options,
  });
}

export async function put<T = any>(url: string, data?: any, options?: Partial<RequestOptions>) {
  return request<T>({
    url,
    method: "PUT",
    data,
    ...options,
  });
}

export async function del<T = any>(url: string, params?: Record<string, any>, options?: Partial<RequestOptions>) {
  return request<T>({
    url,
    method: "DELETE",
    params,
    ...options,
  });
}