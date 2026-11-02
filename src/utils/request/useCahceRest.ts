import {unstable_cache} from "next/cache";
import {del, get, post, put, RequestOptions} from "@utils/request/request";
import {PageResult} from "@/types/api/response/type";
import {Comment} from "@/types/api/product/type";

export type CacheLifePreset =
    | "seconds"
    | "minutes"
    | "hours"
    | "days"
    | "weeks"
    | "max";

export type CacheLifeOption = number | CacheLifePreset;

export interface PageCacheConfig {
  tags: string[];
  life: CacheLifeOption;
}

/**
 * Get revalidate time based on cache life option
 */
export function getRevalidateTime(
    life?: CacheLifeOption
): number | false {
  if (!life) return false;
  if (typeof life === "number") return life;

  switch (life) {
    case "seconds":
      return 10;
    case "minutes":
      return 60;
    case "hours":
      return 3600;
    case "days":
      return 86400;
    case "weeks":
      return 604800;
    case "max":
      return false;
    default:
      return false;
  }
}

/**
 * Stable stringify for cache key generation
 */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj)
      .sort()
      .map(
          (key) => `"${key}":${stableStringify(obj[key])}`
      )
      .join(",")}}`;
}

/**
 * Cache configuration for different pages and queries
 * Centralized management of cache tags and revalidation times
 */
export const PAGE_CACHE_CONFIG: Record<string, PageCacheConfig> = {
  // Home page
  home: {
    tags: ["home-page"],
    life: "hours",
  },

  // Product pages
  product: {
    tags: ["all-products"],
    life: "hours",
  },

  // Category/Collection pages
  category: {
    tags: ["categories"],
    life: "hours",
  },

  // Static content
  static: {
    tags: ["static-content"],
    life: "days",
  },

  // Search results
  search: {
    tags: ["search-results"],
    life: "hours",
  },
};

/**
 * Helper to get cache config for a specific page
 */
export function getPageCacheConfig(
    page: keyof typeof PAGE_CACHE_CONFIG,
): PageCacheConfig {
  return PAGE_CACHE_CONFIG[page];
}

/**
 * Helper to create dynamic product cache config with specific product identifier
 */
export function getProductCacheConfig(productId: number): PageCacheConfig {
  return {
    tags: ["products", `product-${productId}`],
    life: "hours",
  };
}

/**
 * Helper to create dynamic product cache config with specific product identifier
 */
export function getProductReviewCacheConfig(productId: number): PageCacheConfig {
  return {
    tags: ["reviews", `product-${productId}-reviews`],
    life: "hours",
  };
}

/**
 * Helper to create dynamic category cache config with specific category identifier
 */
export function getCategoryCacheConfig(categoryId: string): PageCacheConfig {
  return {
    tags: ["categories", `category-${categoryId}`],
    life: "hours",
  };
}

/**
 * Generic function to create cached request
 * @param config Cache configuration
 * @param cacheKeyPrefix Prefix for cache key
 * @param requestFn Request function to execute
 * @param requestParams Parameters for cache key generation
 * @returns Cached request result
 */
async function createCachedRequest<T = any>(
    config: PageCacheConfig,
    cacheKeyPrefix: string,
    requestFn: () => Promise<T>,
    ...requestParams: any[]
): Promise<T> {
  const revalidate = getRevalidateTime(config.life);

  // Generate cache key from prefix and request parameters
  const cacheKey = `${cacheKeyPrefix}:${requestParams.map(stableStringify).join(":")}`;

  const cachedRequest = unstable_cache(
      requestFn,
      [cacheKey],
      {
        tags: config.tags,
        revalidate,
      }
  );

  return cachedRequest();
}

/**
 * Wrapper for REST API GET requests with automatic cache management
 * Usage: const data = await cachedRestGet('home', '/product/spu/page', params);
 */
export async function cachedRestGet<T = any>(
    page: keyof typeof PAGE_CACHE_CONFIG,
    url: string,
    params?: Record<string, any>,
    options?: Partial<RequestOptions>,
): Promise<T> {
  const config = getPageCacheConfig(page);

  return createCachedRequest<T>(
      config,
      `rest:get:${url}`,
      () => get<T>(url, params, options),
      params,
      options
  );
}

/**
 * Wrapper for REST API POST requests with automatic cache management
 * Usage: const data = await cachedRestPost('home', '/api/products', data);
 */
export async function cachedRestPost<T = any>(
    page: keyof typeof PAGE_CACHE_CONFIG,
    url: string,
    data?: any,
    options?: Partial<RequestOptions>,
): Promise<T> {
  const config = getPageCacheConfig(page);

  return createCachedRequest<T>(
      config,
      `rest:post:${url}`,
      () => post<T>(url, data, options),
      data,
      options
  );
}

/**
 * Wrapper for REST API PUT requests with automatic cache management
 * Usage: const data = await cachedRestPut('product', '/api/products/1', data);
 */
export async function cachedRestPut<T = any>(
    page: keyof typeof PAGE_CACHE_CONFIG,
    url: string,
    data?: any,
    options?: Partial<RequestOptions>,
): Promise<T> {
  const config = getPageCacheConfig(page);

  return createCachedRequest<T>(
      config,
      `rest:put:${url}`,
      () => put<T>(url, data, options),
      data,
      options
  );
}

/**
 * Wrapper for REST API DELETE requests with automatic cache management
 * Usage: const data = await cachedRestDelete('product', '/api/products/1');
 */
export async function cachedRestDelete<T = any>(
    page: keyof typeof PAGE_CACHE_CONFIG,
    url: string,
    params?: Record<string, any>,
    options?: Partial<RequestOptions>,
): Promise<T> {
  const config = getPageCacheConfig(page);

  return createCachedRequest<T>(
      config,
      `rest:delete:${url}`,
      () => del<T>(url, params, options),
      params,
      options
  );
}

/**
 * Wrapper for product-specific REST API requests with dynamic cache tags
 */
export async function cachedProductRequest<T = any>(
    productId: number,
    url: string,
    params?: Record<string, any>,
    options?: Partial<RequestOptions>,
): Promise<T> {
  const config = getProductCacheConfig(productId);

  return createCachedRequest<T>(
      config,
      `rest:product:${productId}:${url}`,
      () => get<T>(url, params, options),
      params,
      options
  );
}

/**
 * Wrapper for product review REST API requests with dynamic cache tags
 */
export async function cachedProductReviewRequest(
    url: string,
    params: {
      spuId: number,
      type: number,
    },
    options?: Partial<RequestOptions>,
): Promise<PageResult<Comment>> {
  const config = getProductReviewCacheConfig(params.spuId);

  return createCachedRequest<PageResult<Comment>>(
      config,
      `rest:review:${params.spuId}:${params.type}:${url}`,
      () => get<PageResult<Comment>>(url, params, options),
      params,
      options
  );
}

/**
 * Wrapper for category-specific REST API requests with dynamic cache tags
 */
export async function cachedCategoryRequest<T = any>(
    categoryId: string,
    url: string,
    params?: Record<string, any>,
    options?: Partial<RequestOptions>,
): Promise<T> {
  const config = getCategoryCacheConfig(categoryId);

  return createCachedRequest<T>(
      config,
      `rest:category:${categoryId}:${url}`,
      () => get<T>(url, params, options),
      params,
      options
  );
}