/**
 * Google Analytics 4 + Google Ads (gtag.js)
 * 两者共用同一个 gtag 脚本
 * 初始化由官方 snippet 自动完成（在 AnalyticsProviders 内联 script 中）
 */

import type {AnalyticsConfig} from '../config';
import {getRuntimeConfig} from '../config';
import type {AnalyticsEventName, EventProps, PageViewParams} from '../types';

/** 页面浏览 */
export function googlePageView(params: PageViewParams) {
  const {gaId, enabled} = getRuntimeConfig().providers.google;
  if (!enabled || typeof window === 'undefined' || !window.gtag) return;

  const configs: string[] = [];
  if (gaId) configs.push(gaId);

  window.gtag('event', 'page_view', {
    page_path: params.path,
    page_title: params.title,
    page_language: params.locale,
    send_to: configs.join(','),
  });
}

/** 通用事件 */
export function googleEvent(name: AnalyticsEventName, props?: EventProps) {
  const {gaId, adsId, enabled} = getRuntimeConfig().providers.google;
  if (!enabled || typeof window === 'undefined' || !window.gtag) return;

  const configs: string[] = [];
  if (gaId) configs.push(gaId);
  if (adsId) configs.push(adsId);

  window.gtag('event', name, {
    ...props,
    send_to: configs.join(','),
  });
}

/** Google gtag.js 脚本 URL（运行时读取，避免模块加载时固化配置） */
export function getGoogleScriptUrl(config?: AnalyticsConfig): string {
  const gaId = (config ?? getRuntimeConfig()).providers.google.gaId;
  return gaId ? `https://www.googletagmanager.com/gtag/js?id=${gaId}` : '';
}

/** Google 内联初始化 snippet（官方标准） */
export function googleInitSnippet(config?: AnalyticsConfig): string {
  const {gaId, adsId, enabled} = (config ?? getRuntimeConfig()).providers.google;
  if (!enabled || !gaId) return '';
  return `
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', '${gaId}', { send_page_view: false });
    ${adsId ? `window.gtag('config', '${adsId}');` : ''}
  `;
}
