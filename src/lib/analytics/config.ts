/**
 * 分析工具 / 广告像素配置
 * 所有 ID 通过环境变量读取，留空则不加载对应平台
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

export const analyticsConfig: AnalyticsConfig = {
  isProduction: process.env.NODE_ENV === 'production',
  // 开发环境下是否发送真实事件（默认 false，避免污染生产数据）
  devModeEnabled: process.env.NEXT_PUBLIC_ANALYTICS_DEV_ENABLED === 'true',
  // 是否需要用户隐私同意才能发送事件
  consentRequired: true,
  providers: {
    google: {
      gaId: process.env.NEXT_PUBLIC_GA_ID || '',
      adsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || '',
      enabled: !!(process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GOOGLE_ADS_ID),
    },
    meta: {
      pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
      enabled: !!process.env.NEXT_PUBLIC_META_PIXEL_ID,
    },
    tiktok: {
      pixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || '',
      enabled: !!process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
    },
    bing: {
      adsId: process.env.NEXT_PUBLIC_BING_ADS_ID || '',
      enabled: !!process.env.NEXT_PUBLIC_BING_ADS_ID,
    },
  },
};

/** 是否有任何像素平台启用 */
export const hasAnyEnabled = () => {
  const p = analyticsConfig.providers;
  return p.google.enabled || p.meta.enabled || p.tiktok.enabled || p.bing.enabled;
};

/**
 * 运行时是否允许发送事件（环境 + 隐私双重检查）
 * consentGiven: true=已同意, false=已拒绝, undefined=未选择
 * consentRequired=true 时，只有明确同意才返回 true
 */
export const canSendEvents = (consentGiven?: boolean): boolean => {
  // 开发环境 + dev 模式关闭 → 不发送
  if (!analyticsConfig.isProduction && !analyticsConfig.devModeEnabled) {
    return false;
  }
  // 没有任何平台启用 → 不发送
  if (!hasAnyEnabled()) return false;
  // 需要隐私同意但用户未明确同意 → 不发送（undefined 或 false 都阻断）
  if (analyticsConfig.consentRequired && consentGiven !== true) {
    return false;
  }
  return true;
};
