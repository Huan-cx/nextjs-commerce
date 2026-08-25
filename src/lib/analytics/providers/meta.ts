/**
 * Meta (Facebook) Pixel
 * 初始化由官方 snippet 自动完成（在 AnalyticsProviders 内联 script 中）
 */

import {analyticsConfig} from '../config';
import type {AnalyticsEventName, EventProps, PageViewParams} from '../types';

const PIXEL_ID = analyticsConfig.providers.meta.pixelId;
export const metaEnabled = analyticsConfig.providers.meta.enabled;

/** 事件名映射：统一名 → Meta 名 */
const EVENT_MAP: Record<string, string> = {
  page_view: 'PageView',
  view_item: 'ViewContent',
  add_to_cart: 'AddToCart',
  remove_from_cart: 'RemoveFromCart',
  begin_checkout: 'InitiateCheckout',
  add_payment_info: 'AddPaymentInfo',
  purchase: 'Purchase',
  sign_up: 'CompleteRegistration',
  search: 'Search',
};

/** 页面浏览 */
export function metaPageView(_params: PageViewParams) {
  if (!metaEnabled || typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'PageView');
}

/** 通用事件 */
export function metaEvent(name: AnalyticsEventName, props?: EventProps) {
  if (!metaEnabled || typeof window === 'undefined' || !window.fbq) return;
  const metaName = EVENT_MAP[name] || name;
  window.fbq('track', metaName, props);
}

/** fbevents.js 脚本 URL */
export const META_SCRIPT_URL = 'https://connect.facebook.net/en_US/fbevents.js';

/** Meta 内联初始化 snippet（官方标准，不包含 SDK 加载） */
export function metaInitSnippet(): string {
  if (!metaEnabled || !PIXEL_ID) return '';
  return `
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;
      n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
      t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window,document,'script','${META_SCRIPT_URL}');
    fbq('init','${PIXEL_ID}',{autoConfig:false});
    fbq('consent','revoke'); // 默认未同意，用户接受后改为 grant
  `;
}

/** Meta Pixel noscript fallback */
export function metaNoscript(): string {
  if (!metaEnabled || !PIXEL_ID) return '';
  return `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1" />`;
}
