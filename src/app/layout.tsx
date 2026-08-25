import "./globals.css";
import {GlobalProviders} from "@/providers";
import {generateMetadataForPage} from "@utils/helper";
import {staticSeo} from "@utils/metadata";
import {SpeculationRules} from "@components/theme/SpeculationRules";
import {ErrorBoundary} from "@/components/error/ErrorBoundary";
import {Metadata} from "next";
import {cookies} from "next/headers";
import {buildOrganizationJsonLd, buildWebSiteJsonLd} from "@/utils/seo-jsonld";
import {AnalyticsProviders} from "@/components/analytics/AnalyticsProviders";
import {RouteChangeListener} from "@/components/analytics/RouteChangeListener";
import {type ConsentStatus, CookieConsentBanner} from "@/components/analytics/CookieConsent";
import {CONSENT_COOKIE_NAME} from "@/lib/analytics/config";
import {ConsentGatedScripts} from "@/components/analytics/ConsentGatedScripts";

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataForPage("", staticSeo.default);
}

const organizationJsonLd = buildOrganizationJsonLd();
const webSiteJsonLd = buildWebSiteJsonLd();

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({children}: Props) {

  // ✅ 在 SSR 阶段读取 cookie — 传给 CookieConsentBanner 作为 initialConsent
  // 彻底消除 hydration flash（banner 要么渲染要么不渲染，SSR 和客户端完全一致）
  // Next.js 16: cookies() 返回 Promise，需要 await
  const cookieStore = await cookies();
  const consentCookie = cookieStore.get(CONSENT_COOKIE_NAME)?.value as ConsentStatus;

  return (
      <html suppressHydrationWarning>
      <head>
        {/* SEO JSON-LD */}
        {organizationJsonLd && (
            <script
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(organizationJsonLd),
                }}
                type="application/ld+json"
            />
        )}
        {webSiteJsonLd && (
            <script
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(webSiteJsonLd),
                }}
                type="application/ld+json"
            />
        )}
        {/* 广告像素 / 分析工具脚本注入 */}
        <AnalyticsProviders/>
      </head>
      <body className="min-h-screen font-outfit text-foreground bg-background antialiased pb-16 lg:pb-0">
      {/* TikTok + Bing 延迟加载（ConsentGatedScripts 必须在 body 内，Client Component） */}
      <ConsentGatedScripts/>
        <main>
          <ErrorBoundary>
            <GlobalProviders>
              {/* 路由变化 → 自动触发 trackPageView */}
              <RouteChangeListener/>
              {children}
            </GlobalProviders>
            <SpeculationRules />
          </ErrorBoundary>
        </main>
      {/* Cookie 隐私同意 Banner — 传入 SSR 读取的初始状态，彻底消除闪现 */}
      <CookieConsentBanner initialConsent={consentCookie}/>
        <span className="dsv-2025.04.19-7e29" />
      </body>
    </html>
  );
}
