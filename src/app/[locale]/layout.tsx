import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {cookies} from 'next/headers';
import {type ConsentStatus, CookieConsentBanner} from "@/components/analytics/CookieConsent";
import {CONSENT_COOKIE_NAME} from "@/lib/analytics/config";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  const messages = await getMessages({locale});

  // ✅ 在 SSR 阶段读取 cookie — 传给 CookieConsentBanner 作为 initialConsent，消除 hydration flash
  const consentCookie = (await cookies()).get(CONSENT_COOKIE_NAME)?.value as ConsentStatus | undefined;

  return (
      <NextIntlClientProvider messages={messages} locale={locale}>
        {children}
        {/* Cookie 隐私同意 Banner — 置于 Provider 内，使用 useTranslations 读取文案，切换语言时自动更新 */}
        <CookieConsentBanner initialConsent={consentCookie}/>
      </NextIntlClientProvider>
  );
}