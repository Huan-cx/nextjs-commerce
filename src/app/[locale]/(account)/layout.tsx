import {ReactNode} from "react";
import {authOptions} from "@utils/auth";
import {getServerSession} from "next-auth/next";
import {getToken} from "next-auth/jwt";
import {redirect} from "next/navigation";

/**
 * 账户路由根 Layout - 全局认证保护
 *
 * 【核心功能】
 * 1. ✅ 统一检查所有 /account/* 页面的登录状态
 * 2. ✅ 未登录或没有 accessToken 时自动重定向到登录页（必须带 locale 前缀）
 * 3. ✅ 避免每个子页面重复写认证逻辑
 */
export default async function AccountRootLayout({
                                                  children,
                                                  params,
                                                }: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const {locale} = await params;

  // 🔐 全局认证检查：所有账户页面都需要登录
  const session = await getServerSession(authOptions);

  if (!session) {
    // ❌ 未登录，重定向到登录页
    // ✅ 必须带 locale 前缀，否则 i18n 路由匹配异常！
    redirect(`/${locale}/customer/login`);
  }

  // 🔐 检查 token 中是否有 accessToken
  const {cookies} = await import("next/headers");
  const cookieStore = await cookies();

  const token = await getToken({
    req: {
      cookies: Object.fromEntries(
          cookieStore.getAll().map(c => [c.name, c.value])
      ),
      headers: {cookie: cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ")},
    } as any,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "next-auth.session-token",
  });

  if (!token?.accessToken) {
    // ❌ 没有 accessToken，重定向到登录页
    redirect(`/${locale}/customer/login`);
  }

  // ✅ 已登录且有 accessToken，渲染子页面
  return children;
}