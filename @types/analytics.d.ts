/**
 * 全局 Window 类型扩展 — 广告像素 SDK
 * 各平台 SDK 加载后会在 window 上挂载各自的全局函数/对象
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => void;

declare global {
  interface Window {
    /** Meta (Facebook) Pixel */
    fbq?: AnyFn;
    /** Google Tag Manager / gtag.js */
    gtag?: AnyFn;
    /** Google dataLayer */
    dataLayer?: unknown[];
    /** TikTok Pixel */
    ttq?: AnyFn;
    /** Microsoft Advertising (Bing UET) */
    uetq?: { push: (item: Record<string, unknown>) => void };
  }
}

export {};
