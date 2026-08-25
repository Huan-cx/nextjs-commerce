'use client';

import {useCallback, useEffect, useState} from 'react';
import {handleConsentChange} from '@/lib/analytics';
import {CONSENT_COOKIE_MAX_AGE, CONSENT_COOKIE_NAME} from '@/lib/analytics/config';

/**
 * Cookie 名称（re-export 从 config.ts 导入的常量）
 * ⚠️ 注意：这个文件是 'use client'，Server Component 不能直接导入这里的 COOKIE_NAME！
 * Server Component 应直接从 @/lib/analytics/config 导入 CONSENT_COOKIE_NAME
 */
export const COOKIE_NAME = CONSENT_COOKIE_NAME;
const COOKIE_MAX_AGE = CONSENT_COOKIE_MAX_AGE;

export type ConsentStatus = 'accepted' | 'declined' | undefined;

function getCookie(): ConsentStatus {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return (match?.[1] as ConsentStatus) || undefined;
}

function setCookie(value: ConsentStatus) {
  if (typeof document === 'undefined') return;
  if (value === undefined) {
    // 删除 cookie
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  } else {
    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }
}

export interface UseCookieConsent {
  consent: ConsentStatus;
  accept: () => void;
  decline: () => void;
  reset: () => void;
}

/** Cookie 同意 Hook */
export function useCookieConsent(initial?: ConsentStatus): UseCookieConsent {
  // ✅ 用 Server Component 传入的 initialConsent 作为初始值 → SSR 和客户端完全一致，消除 hydration mismatch
  // 如果没传 initial（极端情况），fallback 到 undefined + useEffect 读取
  const [consent, setConsent] = useState<ConsentStatus>(initial !== undefined ? initial : undefined);

  // 客户端挂载后重新读取 cookie 兜底（覆盖 cookie 在 SSR 后被修改的边缘情况）
  useEffect(() => {
    const realCookie = getCookie();
    // 只有当 SSR 传入值和实际 cookie 不一致时才更新
    if (realCookie !== initial) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConsent(realCookie);
    }
  }, [initial]);

  const accept = useCallback(() => {
    setCookie('accepted');
    setConsent('accepted');
    // ✅ 同步各平台 consent 状态（Meta fbq + Google gtag）
    handleConsentChange('grant');
  }, []);

  const decline = useCallback(() => {
    setCookie('declined');
    setConsent('declined');
    // ✅ 同步各平台 consent 状态
    handleConsentChange('revoke');
  }, []);

  const reset = useCallback(() => {
    setCookie(undefined);
    setConsent(undefined);
  }, []);

  return {consent, accept, decline, reset};
}

export interface CookieConsentBannerProps {
  /** 初始同意状态（由 Server Component 通过 cookies() 传入，消除闪现） */
  initialConsent?: ConsentStatus;
  /** 是否显示拒绝按钮（默认显示） */
  showDecline?: boolean;
  /** 自定义文案（可选） */
  title?: string;
  description?: string;
  acceptLabel?: string;
  declineLabel?: string;
}

/**
 * Cookie 隐私同意 Banner
 * 简洁版本：只有「接受」和可选的「拒绝」按钮
 */
export function CookieConsentBanner({
                                      initialConsent,
                                      showDecline = true,
                                      title = '我们使用 Cookie',
                                      description = '为了提升您的浏览体验并进行营销分析，本站使用 Cookie 追踪。您可以选择接受或拒绝非必要 Cookie。',
                                      acceptLabel = '接受',
                                      declineLabel = '仅必要',
                                    }: CookieConsentBannerProps) {
  const {consent, accept, decline} = useCookieConsent(initialConsent);

  // consent !== undefined 表示用户已做选择 → 隐藏 banner
  if (consent !== undefined) {
    return null;
  }

  return (
      <div
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 bg-black/90 text-white text-sm
                 flex flex-col sm:flex-row items-start sm:items-center gap-3
                 border-t border-white/10 shadow-2xl"
          role="dialog"
          aria-live="polite"
      >
        <div className="flex-1 max-w-4xl">
          <p className="font-semibold">{title}</p>
          <p className="text-white/80 text-xs mt-1">{description}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {showDecline && (
              <button
                  onClick={decline}
                  className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-sm"
              >
                {declineLabel}
              </button>
          )}
          <button
              onClick={accept}
              className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            {acceptLabel}
          </button>
        </div>
      </div>
  );
}
