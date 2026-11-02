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
import {type AdConfigDTO, type AnalyticsConfig, buildAnalyticsConfig, setRuntimeConfig} from "@/lib/analytics/config";
import {get as serverGet} from "@/utils/request/server";

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataForPage("", staticSeo.default);
}

const organizationJsonLd = buildOrganizationJsonLd();
const webSiteJsonLd = buildWebSiteJsonLd();

type Props = {
  children: React.ReactNode;
};

/**
 * SSR 拉取广告参数配置（来自后端 /marketing/ad-config/list，管理后台 infra_config 实时维护）
 * 失败时回退空配置（不加载任何广告平台），避免接口异常导致整站 500
 */
async function fetchAdConfig(): Promise<AnalyticsConfig> {
  try {
    const data = await serverGet<AdConfigDTO>("marketing/ad-config/list", undefined, {requiresAuth: false});
    return buildAnalyticsConfig(data);
  } catch (error) {
    console.warn("[Analytics] 广告参数配置拉取失败，回退空配置:", error);
    return buildAnalyticsConfig(null);
  }
}

export default async function RootLayout({children}: Props) {
  const adConfig = await fetchAdConfig();
  setRuntimeConfig(adConfig); // 供服务端渲染流程中的 getRuntimeConfig() 使用

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
        {/* 广告像素 / 分析工具脚本注入（config 来自后端服务端配置） */}
        <AnalyticsProviders config={adConfig}/>
      </head>
      <body className="min-h-screen font-outfit text-foreground bg-background antialiased pb-16 lg:pb-0">
      {/* TikTok + Bing 延迟加载（ConsentGatedScripts 必须在 body 内，Client Component） */}
      <ConsentGatedScripts config={adConfig}/>
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
