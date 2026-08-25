/**
 * 统一分析/广告追踪入口
 * 业务代码只调用 trackEvent / trackPageView / trackPurchase 等 API
 * 内部自动分发到所有已启用的平台
 */

import {analyticsConfig, canSendEvents} from './config';
import type {
  AddToCartParams,
  AnalyticsEventName,
  BeginCheckoutParams,
  EventProps,
  PageViewParams,
  PurchaseParams,
  ViewItemParams,
} from './types';
import {googleEvent, googlePageView} from './providers/google';
import {metaEvent, metaPageView} from './providers/meta';
import {tiktokEvent, tiktokPageView} from './providers/tiktok';
import {bingEvent, bingPageView} from './providers/bing';

/** 获取隐私同意状态（从 Cookie 读取） */
function getConsentFromCookie(): boolean | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/analytics_consent=([^;]+)/);
  if (!match) return undefined;
  return match[1] === 'accepted';
}

/**
 * 页面浏览
 * RouteChangeListener 在路由变化时调用此函数
 */
export function trackPageView(params: PageViewParams) {
  const consent = getConsentFromCookie();
  if (!canSendEvents(consent)) return;

  // 调试日志（开发模式 + devMode 开启时可见）
  if (analyticsConfig.devModeEnabled) {
    console.debug('[Analytics] trackPageView', params);
  }

  googlePageView(params);
  metaPageView(params);
  tiktokPageView(params);
  bingPageView(params);
}

/**
 * 通用事件
 */
export function trackEvent(name: AnalyticsEventName, props?: EventProps) {
  const consent = getConsentFromCookie();
  if (!canSendEvents(consent)) return;

  if (analyticsConfig.devModeEnabled) {
    console.debug('[Analytics] trackEvent', name, props);
  }

  googleEvent(name, props);
  metaEvent(name, props);
  tiktokEvent(name, props);
  bingEvent(name, props);
}

/** 查看商品 */
export function trackViewItem(params: ViewItemParams) {
  trackEvent('view_item', normalizeEcommerceItem(params));
}

/** 加入购物车 */
export function trackAddToCart(params: AddToCartParams) {
  trackEvent('add_to_cart', normalizeEcommerceItem(params));
}

/** 发起结算 */
export function trackBeginCheckout(params?: BeginCheckoutParams) {
  trackEvent('begin_checkout', normalizeEcommerceBase(params));
}

/** 购买完成 */
export function trackPurchase(params: PurchaseParams) {
  // 统一字段名：同时传 order_id 和 orderId，兼容各平台
  const normalized: any = normalizeEcommerceBase(params);
  if (params.orderId && !normalized.order_id) normalized.order_id = params.orderId;
  if (params.order_id && !normalized.orderId) normalized.orderId = params.order_id;
  if (params.transaction_id) normalized.transaction_id = params.transaction_id;
  trackEvent('purchase', normalized);
}

// ========== 内部工具：字段名归一化 ==========

function normalizeEcommerceItem(p: any) {
  const out: any = {};
  if (p.product_id !== undefined) out.product_id = p.product_id;
  else if (p.productId !== undefined) out.product_id = p.productId;
  if (p.quantity !== undefined) out.quantity = p.quantity;
  if (p.price !== undefined) out.price = p.price;
  if (p.value !== undefined) out.value = p.value;
  if (p.currency !== undefined) out.currency = p.currency;
  if (p.items) out.items = p.items;
  // 透传其余字段
  for (const key of Object.keys(p)) {
    if (!['productId', 'orderId'].includes(key) && !(key in out)) {
      out[key] = p[key];
    }
  }
  return out;
}

function normalizeEcommerceBase(p?: any) {
  if (!p) return {};
  const out: any = {};
  if (p.value !== undefined) out.value = p.value;
  if (p.currency !== undefined) out.currency = p.currency;
  if (p.items) out.items = p.items;
  return out;
}

// ========== 隐私同意同步 ==========

type ConsentAction = 'grant' | 'revoke';

/**
 * 用户同意状态变化时调用
 * - 同步 Google/Meta 的 runtime consent API
 * - dispatch window CustomEvent 让 ConsentGatedScripts 能动态加载 TikTok/Bing SDK
 */
export function handleConsentChange(action: ConsentAction) {
  if (typeof window === 'undefined') return;

  // Meta Pixel consent 同步（仅当 SDK 已加载时）
  if (window.fbq) {
    window.fbq('consent', action);
  }

  // Google gtag consent 同步（仅当 SDK 已加载时）
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: action === 'grant' ? 'granted' : 'denied',
      ad_storage: action === 'grant' ? 'granted' : 'denied',
      ad_user_data: action === 'grant' ? 'granted' : 'denied',
      ad_personalization: action === 'grant' ? 'granted' : 'denied',
    });
  }

  // ✅ 通知 ConsentGatedScripts（TikTok/Bing 延迟加载组件）
  // 映射 grant→accepted, revoke→declined，和 cookie 值保持一致
  window.dispatchEvent(
      new CustomEvent('analytics-consent', {
        detail: action === 'grant' ? 'accepted' : 'declined',
      }),
  );

  if (analyticsConfig.devModeEnabled) {
    console.debug('[Analytics] consent changed →', action);
  }
}
