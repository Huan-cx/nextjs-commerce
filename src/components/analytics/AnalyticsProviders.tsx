import type {AnalyticsConfig} from '@/lib/analytics/config';
import {getGoogleScriptUrl, googleInitSnippet} from '@/lib/analytics/providers/google';
import {metaInitSnippet, metaNoscript} from '@/lib/analytics/providers/meta';

/**
 * Google + Meta 脚本注入（Server Component）
 * 这两家平台有 **runtime consent API**（fbq('consent', ...) / gtag('consent', ...)）
 * 可以先 eager 加载 SDK，用户拒绝后在运行时 revoke → 脚本保持加载但不发送数据
 *
 * TikTok + Bing 没有 runtime consent API → 由 ConsentGatedScripts（Client Component）延迟加载
 *
 * config 由 RootLayout SSR 时从后端 /marketing/ad-config/list 拉取并传入（管理后台实时配置）
 */
export function AnalyticsProviders({config}: { config: AnalyticsConfig }) {
  const p = config.providers;
  const shouldInject =
      (config.isProduction || config.devModeEnabled) &&
      (p.google.enabled || p.meta.enabled);

  if (!shouldInject) return null;

  const googleScriptUrl = getGoogleScriptUrl(config);

  return (
      <>
        {/* ===== Google Analytics 4 + Google Ads ===== */}
        {p.google.enabled && (
            <>
              {/* 先加载 gtag.js SDK（async：SDK 加载后替换 init snippet 注册的 stub） */}
              {googleScriptUrl && (
                  <script
                      key="ga-gtag-js"
                      src={googleScriptUrl}
                      async
                  />
              )}
              {/* 再用官方 snippet 初始化（同步执行，先注册 gtag stub 再等 SDK） */}
              <script
                  key="google-gtag-config"
                  dangerouslySetInnerHTML={{
                    __html: googleInitSnippet(config),
                  }}
              />
            </>
        )}

        {/* ===== Meta (Facebook) Pixel ===== */}
        {p.meta.enabled && (
            <>
              {/* 官方完整 snippet（含 fbevents.js 异步加载 + fbq('init') + consent('revoke')） */}
              <script
                  key="meta-pixel"
                  dangerouslySetInnerHTML={{
                    __html: metaInitSnippet(config),
                  }}
              />
              {/* noscript fallback */}
              <noscript>
                <div dangerouslySetInnerHTML={{__html: metaNoscript(config)}}/>
              </noscript>
            </>
        )}

        {/* ===== TikTok + Bing 由 ConsentGatedScripts 延迟加载 ===== */}
      </>
  );
}
