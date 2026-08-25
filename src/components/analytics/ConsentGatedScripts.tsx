'use client';

import Script from 'next/script';
import {useEffect, useRef, useState} from 'react';
import {analyticsConfig} from '@/lib/analytics/config';
import {tiktokEnabled, tiktokInitSnippet} from '@/lib/analytics/providers/tiktok';
import {bingEnabled, bingInitSnippet} from '@/lib/analytics/providers/bing';

const CONSENT_COOKIE = 'analytics_consent';

function readConsentCookie(): boolean {
  if (typeof document === 'undefined') return false;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  return match?.[1] === 'accepted';
}

/**
 * TikTok + Bing 延迟加载组件（Client Component）
 *
 * 这两家平台 **没有 runtime consent API**（不像 Meta 的 fbq('consent', ...)）
 * 所以必须在用户同意后才加载 SDK 脚本
 *
 * 触发加载的时机：
 * 1. lazy initializer 读 cookie → 如果已 accepted，直接渲染脚本
 * 2. 监听 window 'analytics-consent' CustomEvent → 用户点击 Banner 接受时动态加载
 */
export function ConsentGatedScripts() {
  const shouldLoad = tiktokEnabled || bingEnabled;
  const canInject = (analyticsConfig.isProduction || analyticsConfig.devModeEnabled) && shouldLoad;
  // 用 lazy initializer 避免 effect 中 setState（react-hooks 规则）
  const [consentGranted, setConsentGranted] = useState(() => readConsentCookie());
  const loadedRef = useRef(consentGranted);

  useEffect(() => {
    if (!canInject) return;

    // 监听用户后续点击 Banner 的事件
    // 事件回调中 setState 是 OK 的（不是 effect 主体中同步调用）
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === 'accepted' && !loadedRef.current) {
        loadedRef.current = true;
        setConsentGranted(true);
      } else if (detail === 'declined') {
        loadedRef.current = false;
        setConsentGranted(false);
      }
    };
    window.addEventListener('analytics-consent', handler);
    return () => window.removeEventListener('analytics-consent', handler);
  }, [canInject]);

  if (!canInject || !consentGranted) return null;

  return (
      <>
        {/* ===== TikTok Pixel（延迟加载） ===== */}
        {tiktokEnabled && (
            <Script
                id="tiktok-pixel"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: tiktokInitSnippet(),
                }}
            />
        )}

        {/* ===== Microsoft Advertising UET（延迟加载） ===== */}
        {bingEnabled && (
            <Script
                id="bing-uet"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: bingInitSnippet(),
                }}
            />
        )}
      </>
  );
}
