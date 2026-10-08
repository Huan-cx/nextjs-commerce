'use client';

import {useEffect, useRef} from 'react';
import {usePathname} from 'next/navigation';
import {handleConsentChange, trackPageView} from '@/lib/analytics';
import {captureAttributionOnClient} from '@/lib/analytics/attribution';

/**
 * 监听路由变化 → 触发 trackPageView
 * 必须是 'use client' 组件才能使用 usePathname
 * 放在 RootLayout 的 GlobalProviders 内部或 body 中
 *
 * 注意：不使用 useSearchParams() 以避免强制整个 RootLayout 变成 dynamic rendering
 * （Next.js App Router 中 useSearchParams 会跳过静态生成）
 */
export function RouteChangeListener() {
  const pathname = usePathname();
  const consentSynced = useRef(false);

  // ===== 首次挂载：根据 cookie 同步 SDK 的 consent 状态 =====
  // 覆盖场景：
  //   - 回访用户（cookie=accepted）：SDK 初始化默认 revoke，这里修正为 grant
  //   - 回访用户（cookie=declined）：SDK 默认 revoke，状态一致，无需变化
  //   - 首次访问（无 cookie）：SDK 默认 revoke，等用户点击 Banner 时再 grant
  useEffect(() => {
    if (consentSynced.current) return;
    consentSynced.current = true;

    if (typeof document === 'undefined') return;
    const match = document.cookie.match(/analytics_consent=([^;]+)/);
    const cookieValue = match?.[1];

    if (cookieValue === 'accepted') {
      handleConsentChange('grant');
    } else if (cookieValue === 'declined') {
      handleConsentChange('revoke');
    }
    // undefined（首次访问）：SDK 默认 revoke → 保持一致，等 Banner 交互
  }, []);

  // ===== 路由变化：触发 page_view =====
  useEffect(() => {
    if (!pathname) return;

    // 用 window.location.search 替代 useSearchParams，避免强制 dynamic rendering
    const queryString =
        typeof window !== 'undefined' && window.location.search
            ? window.location.search
            : '';

    // ===== 广告归因落地捕获（客户端兜底） =====
    // 服务端 proxy 已处理"已同意"场景；这里覆盖：
    //   - 未同意访客：暂存 sessionStorage，CookieConsent accept 时提升为 cookie
    //   - 服务端未捕获到的边缘场景（first-touch 判断保证幂等）
    const consentMatch = document.cookie.match(/analytics_consent=([^;]+)/);
    captureAttributionOnClient(consentMatch?.[1] === 'accepted');

    const url = pathname + queryString;
    const title = typeof document !== 'undefined' ? document.title : undefined;
    const locale = pathname.split('/').filter(Boolean)[0] || undefined;

    trackPageView({
      path: url,
      title,
      locale,
    });
  }, [pathname]);

  // 组件本身不渲染任何 UI
  return null;
}
