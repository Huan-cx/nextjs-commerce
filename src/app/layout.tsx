import "./globals.css";
import {GlobalProviders} from "@/providers";
import {generateMetadataForPage} from "@utils/helper";
import {staticSeo} from "@utils/metadata";
import {SpeculationRules} from "@components/theme/SpeculationRules";
import {ErrorBoundary} from "@/components/error/ErrorBoundary";
import {Metadata} from "next";
import {buildOrganizationJsonLd, buildWebSiteJsonLd} from "@/utils/seo-jsonld";
import {AnalyticsProviders} from "@/components/analytics/AnalyticsProviders";
import {RouteChangeListener} from "@/components/analytics/RouteChangeListener";
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
        <span className="dsv-2025.04.19-7e29" />
      </body>
    </html>
  );
}
