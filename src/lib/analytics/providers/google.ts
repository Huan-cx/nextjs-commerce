/**
 * Google Analytics 4 + Google Ads (gtag.js)
 * 两者共用同一个 gtag 脚本
 * 初始化由官方 snippet 自动完成（在 AnalyticsProviders 内联 script 中）
 */

import {analyticsConfig} from '../config';
import type {AnalyticsEventName, EventProps, PageViewParams} from '../types';

const GA_ID = analyticsConfig.providers.google.gaId;
const ADS_ID = analyticsConfig.providers.google.adsId;
export const googleEnabled = analyticsConfig.providers.google.enabled;

/** 页面浏览 */
export function googlePageView(params: PageViewParams) {
  if (!googleEnabled || typeof window === 'undefined' || !window.gtag) return;

  const configs: string[] = [];
  if (GA_ID) configs.push(GA_ID);

  window.gtag('event', 'page_view', {
    page_path: params.path,
    page_title: params.title,
    page_language: params.locale,
    send_to: configs.join(','),
  });
}

/** 通用事件 */
export function googleEvent(name: AnalyticsEventName, props?: EventProps) {
  if (!googleEnabled || typeof window === 'undefined' || !window.gtag) return;

  const configs: string[] = [];
  if (GA_ID) configs.push(GA_ID);
  if (ADS_ID) configs.push(ADS_ID);

  window.gtag('event', name, {
    ...props,
    send_to: configs.join(','),
  });
}

/** Google gtag.js 脚本 URL */
export const GOOGLE_SCRIPT_URL = GA_ID
    ? `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    : '';

/** Google 内联初始化 snippet（官方标准） */
export function googleInitSnippet(): string {
  if (!googleEnabled || !GA_ID) return '';
  return `
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', '${GA_ID}', { send_page_view: false });
    ${ADS_ID ? `window.gtag('config', '${ADS_ID}');` : ''}
  `;
}
