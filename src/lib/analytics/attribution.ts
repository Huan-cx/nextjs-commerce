/**
 * 广告来源归因工具
 *
 * 业界标准做法：广告点击后落地页 URL 会携带 click ID（gclid/fbclid/ttclid/msclkid）
 * 和 UTM 参数，这些参数只在落地瞬间存在，必须立即捕获并持久化（first-touch 归因）。
 *
 * 数据流：
 *   广告点击 → 落地页 URL 带参数 → proxy.ts（已同意时）/ 客户端（未同意时暂存）捕获
 *   → 第一方 cookie ad_attribution（30 天）→ 提交询价时附带进 payload → 后端落库
 *
 * 本文件为纯函数模块（无 'use client'），服务端（proxy.ts）和客户端均可导入。
 */

/** 归因 cookie 名称 */
export const ATTRIBUTION_COOKIE_NAME = 'ad_attribution';
/** 归因 cookie 有效期：30 天（业界标准广告归因窗口） */
export const ATTRIBUTION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;
/** 未同意前暂存到 sessionStorage 的 key（用户同意后提升为 cookie） */
export const ATTRIBUTION_SESSION_KEY = 'ad_attribution_pending';

/** 广告平台 */
export type AdPlatform = 'google' | 'meta' | 'tiktok' | 'bing' | 'other';

/** 归因数据 */
export interface AttributionData {
  platform: AdPlatform;
  clickId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  /** 落地页路径 */
  landingPage?: string;
  /** 捕获时间（ISO） */
  capturedAt: string;
}

/** click ID 参数名 → 平台映射 */
const CLICK_ID_MAP: Record<string, AdPlatform> = {
  gclid: 'google',
  gbraid: 'google',
  wbraid: 'google',
  fbclid: 'meta',
  igshid: 'meta',
  ttclid: 'tiktok',
  msclkid: 'bing',
};

/** 根据 utm_source 推断平台（无 click ID 时的兜底） */
function inferPlatformFromSource(source: string): AdPlatform {
  const s = source.toLowerCase();
  if (s.includes('google')) return 'google';
  if (s.includes('facebook') || s.includes('meta') || s.includes('instagram')) return 'meta';
  if (s.includes('tiktok')) return 'tiktok';
  if (s.includes('bing') || s.includes('microsoft')) return 'bing';
  return 'other';
}

/**
 * 从 URL 参数解析归因数据
 * 无 click ID 且无 UTM 参数时返回 null（非广告落地）
 */
export function parseAttributionFromParams(
    searchParams: URLSearchParams,
    landingPage?: string,
): AttributionData | null {
  let platform: AdPlatform | undefined;
  let clickId: string | undefined;

  for (const [param, p] of Object.entries(CLICK_ID_MAP)) {
    const v = searchParams.get(param);
    if (v) {
      platform = p;
      clickId = v;
      break;
    }
  }

  const utmSource = searchParams.get('utm_source') ?? undefined;
  const utmMedium = searchParams.get('utm_medium') ?? undefined;
  const utmCampaign = searchParams.get('utm_campaign') ?? undefined;
  const utmTerm = searchParams.get('utm_term') ?? undefined;
  const utmContent = searchParams.get('utm_content') ?? undefined;

  // 无 click ID 且无任何 UTM 参数 → 不是广告落地
  if (!platform && !utmSource && !utmMedium && !utmCampaign) return null;

  // 无 click ID 时用 utm_source 推断平台
  if (!platform && utmSource) {
    platform = inferPlatformFromSource(utmSource);
  }

  return {
    platform: platform ?? 'other',
    clickId,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    landingPage,
    capturedAt: new Date().toISOString(),
  };
}

// ========== Cookie 读写（客户端） ==========

/** 读取归因 cookie */
export function readAttributionCookie(): AttributionData | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${ATTRIBUTION_COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as AttributionData;
  } catch {
    return null;
  }
}

/** 写入归因 cookie（first-touch：调用方需自行判断是否已存在） */
export function writeAttributionCookie(data: AttributionData) {
  if (typeof document === 'undefined') return;
  document.cookie =
      `${ATTRIBUTION_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(data))}; ` +
      `path=/; max-age=${ATTRIBUTION_COOKIE_MAX_AGE}; SameSite=Lax`;
}

// ========== sessionStorage 暂存（未同意 consent 时的兜底） ==========

/** 暂存归因数据（用户尚未同意 analytics cookie 时） */
export function stashAttribution(data: AttributionData) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(ATTRIBUTION_SESSION_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage 不可用（隐私模式等）时静默忽略
  }
}

/** 取出并清除暂存的归因数据（用户同意后调用） */
export function popStashedAttribution(): AttributionData | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(ATTRIBUTION_SESSION_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(ATTRIBUTION_SESSION_KEY);
  try {
    return JSON.parse(raw) as AttributionData;
  } catch {
    return null;
  }
}

/**
 * 客户端捕获当前 URL 中的归因参数（落地捕获兜底）
 * - 已同意 consent → 直接写 cookie（first-touch，已有则不覆盖）
 * - 未同意 → 暂存 sessionStorage，等 CookieConsent accept 时提升为 cookie
 */
export function captureAttributionOnClient(consentAccepted: boolean) {
  if (typeof window === 'undefined') return;
  const searchParams = new URLSearchParams(window.location.search);
  const attribution = parseAttributionFromParams(searchParams, window.location.pathname);
  if (!attribution) return;

  if (consentAccepted) {
    if (!readAttributionCookie()) {
      writeAttributionCookie(attribution);
    }
  } else {
    // 未同意：仅当没有已持久化的归因时才暂存
    if (!readAttributionCookie()) {
      stashAttribution(attribution);
    }
  }
}

/** 用户同意 consent 后，把暂存的归因提升为 cookie */
export function promoteStashedAttribution() {
  const stashed = popStashedAttribution();
  if (stashed && !readAttributionCookie()) {
    writeAttributionCookie(stashed);
  }
}

/**
 * 获取提交询价时附带的归因字段
 * 无归因数据时返回空对象（后端字段均为可选）
 */
export function getAttributionForRfq(): {
  adPlatform?: string;
  adClickId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  const data = readAttributionCookie();
  if (!data) return {};
  return {
    adPlatform: data.platform,
    adClickId: data.clickId,
    utmSource: data.utmSource,
    utmMedium: data.utmMedium,
    utmCampaign: data.utmCampaign,
  };
}
