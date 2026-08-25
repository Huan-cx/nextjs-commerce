/**
 * Microsoft Advertising (Bing) UET
 * 初始化由官方 snippet 自动完成
 */

import {analyticsConfig} from '../config';
import type {AnalyticsEventName, EventProps, PageViewParams} from '../types';

const ADS_ID = analyticsConfig.providers.bing.adsId;
export const bingEnabled = analyticsConfig.providers.bing.enabled;

/** 事件名映射 */
const EVENT_MAP: Record<string, string> = {
  page_view: 'pageview',
  view_item: 'view_item',
  add_to_cart: 'add_to_cart',
  begin_checkout: 'begin_checkout',
  purchase: 'purchase',
  sign_up: 'sign_up',
};

/** 页面浏览 */
export function bingPageView(_params: PageViewParams) {
  if (!bingEnabled || typeof window === 'undefined' || !window.uetq) return;
  window.uetq.push({'event': 'pageview'});
}

/** 通用事件 */
export function bingEvent(name: AnalyticsEventName, props?: EventProps) {
  if (!bingEnabled || typeof window === 'undefined' || !window.uetq) return;
  const label = EVENT_MAP[name] || name;
  window.uetq.push({'event': label, ...(props && {'ec': props})});
}

/** Bing UET 内联初始化 snippet（官方标准，包含 SDK 加载） */
export function bingInitSnippet(): string {
  if (!bingEnabled || !ADS_ID) return '';
  return `
    (function(w,d,t,r,u){
      var f,n,i; w[u]=w[u]||[],f=function(){
        var o={ti:'${ADS_ID}',sn:window.navigator.pointerEnabled?'pointer':window.navigator.msPointerEnabled?'mspointer':undefined};
        o.qsa=function(a,b){this.sn==='pointer'?(w.uetq.push({'el':b}),b.el.className='uetq-active',b.el.style.color='#FFF'):(w.uetq.push({'e':'click','el':b,fn:a,qsa:!0}));};
        w[u].push(o);
      };n=d.createElement('script');n.async=!0;n.src=r;
      i=d.getElementsByTagName('script')[0];i.parentNode.insertBefore(n,i);
      w.uetq.push({'gc':'${ADS_ID}'});
    })(window,document,'script','https://bat.bing.com/bat.js','uetq');
  `;
}
