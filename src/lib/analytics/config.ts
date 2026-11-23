/**
 * 分析工具 / 广告像素配置
 *
 * 配置来源：服务端运行时配置
 * SSR 时从 /app-api/marketing/ad-config/list 拉取（管理后台 infra_config 参数配置维护，实时生效）
 * 拉取失败或未配置时使用空配置（不加载任何广告平台）
 */

/** 隐私同意 Cookie 名称（必须放在非 use-client 文件，SSR 和 CSR 都能安全导入） */
export const CONSENT_COOKIE_NAME = 'analytics_consent';
/** 隐私同意 Cookie 有效期（1 年，秒） */
export const CONSENT_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

export interface AnalyticsConfig {
  isProduction: boolean;
  devModeEnabled: boolean;
  consentRequired: boolean;
  providers: {
    google: {
      gaId: string;       // G-XXXXXXX
      adsId: string;      // AW-XXXXXXX
      enabled: boolean;
    };
    meta: {
      pixelId: string;    // XXXXXXXXXXXXXXXX
      enabled: boolean;
    };
    tiktok: {
      pixelId: string;    // XXXXXXXXXXXXXXXX
      enabled: boolean;
    };
    bing: {
      adsId: string;      // XXXXXXXXXX
      enabled: boolean;
    };
  };
}

/** 空配置（服务端配置拉取失败/未配置时的安全默认：不加载任何广告平台） */
const EMPTY_CONFIG: AnalyticsConfig = {
  isProduction: process.env.NODE_ENV === 'production',
  devModeEnabled: false,
  consentRequired: true,
  providers: {
    google: {gaId: '', adsId: '', enabled: false},
    meta: {pixelId: '', enabled: false},
    tiktok: {pixelId: '', enabled: false},
    bing: {adsId: '', enabled: false},
  },
};

/** 服务端广告配置 DTO（/app-api/marketing/ad-config/list 返回结构） */
export interface AdConfigDTO {
  gaId?: string | null;
  googleAdsId?: string | null;
  metaPixelId?: string | null;
  tiktokPixelId?: string | null;
  bingAdsId?: string | null;
  devEnabled?: boolean | null;
}

/**
 * 根据服务端广告配置构建运行时 AnalyticsConfig
 * dto 为空（接口不可用）时返回空配置，不加载任何广告平台
 */
export function buildAnalyticsConfig(dto?: AdConfigDTO | null): AnalyticsConfig {
  if (!dto) return EMPTY_CONFIG;
  const gaId = dto.gaId || '';
  const googleAdsId = dto.googleAdsId || '';
  const metaPixelId = dto.metaPixelId || '';
  const tiktokPixelId = dto.tiktokPixelId || '';
  const bingAdsId = dto.bingAdsId || '';
  return {
    isProduction: process.env.NODE_ENV === 'production',
    devModeEnabled: dto.devEnabled ?? false,
    consentRequired: true,
    providers: {
      google: {
        gaId,
        adsId: googleAdsId,
        enabled: !!(gaId || googleAdsId),
      },
      meta: {
        pixelId: metaPixelId,
        enabled: !!metaPixelId,
      },
      tiktok: {
        pixelId: tiktokPixelId,
        enabled: !!tiktokPixelId,
      },
      bing: {
        adsId: bingAdsId,
        enabled: !!bingAdsId,
      },
    },
  };
}

/** 运行时配置（服务端 SSR 拉取后注入 / 客户端经 ConsentGatedScripts 同步） */
let runtimeConfig: AnalyticsConfig | null = null;

/** 设置运行时配置 */
export function setRuntimeConfig(config: AnalyticsConfig) {
  runtimeConfig = config;
}

/** 获取当前生效配置：优先运行时配置，否则返回空配置（不加载任何广告平台） */
export function getRuntimeConfig(): AnalyticsConfig {
  return runtimeConfig ?? EMPTY_CONFIG;
}

/** 是否有任何像素平台启用 */
export const hasAnyEnabled = () => {
  const p = getRuntimeConfig().providers;
  return p.google.enabled || p.meta.enabled || p.tiktok.enabled || p.bing.enabled;
};

/**
 * 运行时是否允许发送事件（环境 + 隐私双重检查）
 * consentGiven: true=已同意, false=已拒绝, undefined=未选择
 * consentRequired=true 时，只有明确同意才返回 true
 */
export const canSendEvents = (consentGiven?: boolean): boolean => {
  const config = getRuntimeConfig();
  // 开发环境 + dev 模式关闭 → 不发送
  if (!config.isProduction && !config.devModeEnabled) {
    return false;
  }
  // 没有任何平台启用 → 不发送
  if (!hasAnyEnabled()) return false;
  // 需要隐私同意但用户未明确同意 → 不发送（undefined 或 false 都阻断）
  if (config.consentRequired && consentGiven !== true) {
    return false;
  }
  return true;
};
