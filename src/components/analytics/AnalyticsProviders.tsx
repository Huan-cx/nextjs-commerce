import Script from 'next/script';
import {analyticsConfig} from '@/lib/analytics/config';
import {GOOGLE_SCRIPT_URL, googleInitSnippet} from '@/lib/analytics/providers/google';
import {metaEnabled, metaInitSnippet, metaNoscript} from '@/lib/analytics/providers/meta';

/**
 * Google + Meta 脚本注入（Server Component）
 * 这两家平台有 **runtime consent API**（fbq('consent', ...) / gtag('consent', ...)）
 * 可以先 eager 加载 SDK，用户拒绝后在运行时 revoke → 脚本保持加载但不发送数据
 *
 * TikTok + Bing 没有 runtime consent API → 由 ConsentGatedScripts（Client Component）延迟加载
 */
export function AnalyticsProviders() {
  const p = analyticsConfig.providers;
  const shouldInject =
      (analyticsConfig.isProduction || analyticsConfig.devModeEnabled) &&
      (p.google.enabled || p.meta.enabled);

  if (!shouldInject) return null;

  return (
      <>
        {/* ===== Google Analytics 4 + Google Ads ===== */}
        {p.google.enabled && (
            <>
              {/* 先加载 gtag.js SDK */}
              {GOOGLE_SCRIPT_URL && (
                  <Script
                      src={GOOGLE_SCRIPT_URL}
                      strategy="beforeInteractive"
                  />
              )}
              {/* 再用官方 snippet 初始化 */}
              <Script
                  id="google-gtag-config"
                  strategy="beforeInteractive"
                  dangerouslySetInnerHTML={{
                    __html: googleInitSnippet(),
                  }}
              />
            </>
        )}

        {/* ===== Meta (Facebook) Pixel ===== */}
        {metaEnabled && (
            <>
              {/* 官方完整 snippet（含 fbevents.js 异步加载 + fbq('init') + consent('revoke')） */}
              <Script
                  id="meta-pixel"
                  strategy="beforeInteractive"
                  dangerouslySetInnerHTML={{
                    __html: metaInitSnippet(),
                  }}
              />
              {/* noscript fallback */}
              <noscript>
                <div dangerouslySetInnerHTML={{__html: metaNoscript()}}/>
              </noscript>
            </>
        )}

        {/* ===== TikTok + Bing 由 ConsentGatedScripts 延迟加载 ===== */}
      </>
  );
}
