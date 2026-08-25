/**
 * TikTok Pixel
 * 初始化由官方 snippet 自动完成（在 AnalyticsProviders 内联 script 中）
 */

import {analyticsConfig} from '../config';
import type {AnalyticsEventName, EventProps, PageViewParams} from '../types';

const PIXEL_ID = analyticsConfig.providers.tiktok.pixelId;
export const tiktokEnabled = analyticsConfig.providers.tiktok.enabled;

/** 事件名映射：统一名 → TikTok 名 */
const EVENT_MAP: Record<string, string> = {
  page_view: 'PageView',
  view_item: 'ViewContent',
  add_to_cart: 'AddToCart',
  remove_from_cart: 'RemoveFromCart',
  begin_checkout: 'InitiateCheckout',
  add_payment_info: 'AddPaymentInfo',
  purchase: 'CompletePayment',
  sign_up: 'CompleteRegistration',
  search: 'Search',
};

/** 页面浏览 */
export function tiktokPageView(_params: PageViewParams) {
  if (!tiktokEnabled || typeof window === 'undefined' || !window.ttq) return;
  window.ttq('track', 'PageView');
}

/** 通用事件 */
export function tiktokEvent(name: AnalyticsEventName, props?: EventProps) {
  if (!tiktokEnabled || typeof window === 'undefined' || !window.ttq) return;
  const ttName = EVENT_MAP[name] || name;
  window.ttq('track', ttName, props);
}

/** TikTok 脚本 URL */
export const TIKTOK_SCRIPT_URL = 'https://analytics.tiktok.com/tt.sdk.js';

/** TikTok 内联初始化 snippet（官方标准，包含 SDK 加载） */
export function tiktokInitSnippet(): string {
  if (!tiktokEnabled || !PIXEL_ID) return '';
  return `
    !function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = ['pageview', 'track', 'identify', 'instances', 'refresh', 'config'];
      ttq.set = ttq.set || [];
      ttq.queue = ttq.queue || [];
      var f = d.getElementsByTagName('script')[0], j = d.createElement('script');
      j.async = 1; j.src = '${TIKTOK_SCRIPT_URL}';
      f.parentNode.insertBefore(j, f);
    }(window, document, 'ttq');
    ttq.config({
      '${PIXEL_ID}': { trackPage: false },
    });
  `;
}
