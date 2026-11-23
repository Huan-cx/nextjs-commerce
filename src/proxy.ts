import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {getToken} from 'next-auth/jwt'
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NEXTAUTH_SECURE_TOKEN, NEXTAUTH_TOKEN} from '@/utils/constants';
import {CONSENT_COOKIE_NAME} from '@/lib/analytics/config';
import {
    ATTRIBUTION_COOKIE_MAX_AGE,
    ATTRIBUTION_COOKIE_NAME,
    parseAttributionFromParams,
} from '@/lib/analytics/attribution';

// 静态资源文件扩展名（通用检测：路径以扩展名结尾的直接放行）
const STATIC_FILE_REGEX = /\.[a-zA-Z0-9]+$/;

// 创建国际化中间件
const intlMiddleware = createMiddleware(routing);

/**
 * 广告归因捕获（服务端，落地瞬间捕获 click ID / UTM 参数）
 * - first-touch：已有归因 cookie 则不覆盖
 * - GDPR：仅当用户已接受 analytics consent 时才写入归因 cookie
 *   （未同意的访客由客户端 RouteChangeListener 暂存 sessionStorage，同意后提升为 cookie）
 */
function applyAttributionCapture(request: NextRequest, response: NextResponse): NextResponse {
    // first-touch：已有归因则跳过
    if (request.cookies.get(ATTRIBUTION_COOKIE_NAME)) return response;
    // 未同意 consent → 不写营销类 cookie
    if (request.cookies.get(CONSENT_COOKIE_NAME)?.value !== 'accepted') return response;

    const attribution = parseAttributionFromParams(
        request.nextUrl.searchParams,
        request.nextUrl.pathname,
    );
    if (!attribution) return response;

    response.cookies.set(ATTRIBUTION_COOKIE_NAME, JSON.stringify(attribution), {
        path: '/',
        maxAge: ATTRIBUTION_COOKIE_MAX_AGE,
        sameSite: 'lax',
    });
    return response;
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 通用规则：任何以文件扩展名结尾的路径（如 .xsl, .xml, .png, .pdf），直接跳过 locale 中间件
    // 这样 /public 下的静态资源自动生效，无需手动维护扩展名列表
    if (STATIC_FILE_REGEX.test(pathname)) {
        return NextResponse.next();
    }

    // 国际化中间件处理
    const intlResponse = intlMiddleware(request);
    if (intlResponse) {
        // 广告落地捕获（含 locale 重定向响应也一并带上 cookie）
        return applyAttributionCapture(request, intlResponse);
    }

    // 认证中间件处理（注意：路径会包含locale前缀）
    const restrictedPaths = ['/customer/login', '/customer/register']

    if (restrictedPaths.some((path) => pathname.includes(path))) {
        // 显式指定 cookieName，确保 HTTPS 生产环境下也能正确读取
        const isSecureCookie = (process.env.NEXTAUTH_URL ?? '').startsWith('https');
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: isSecureCookie ? NEXTAUTH_SECURE_TOKEN : NEXTAUTH_TOKEN,
        })

        if (token) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // 直接访问带 locale 的 URL（无重定向）→ 同样需要落地捕获
    return applyAttributionCapture(request, NextResponse.next())
}

// 保持middleware作为别名，兼容旧代码
export {proxy as middleware}

// 配置matcher：仅排除系统路径，静态资源在函数体内通用处理
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image).*)'
    ],
}