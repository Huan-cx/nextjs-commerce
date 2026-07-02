import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {getToken} from 'next-auth/jwt'
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NEXTAUTH_SECURE_TOKEN, NEXTAUTH_TOKEN} from '@/utils/constants';

// 创建国际化中间件
const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 国际化中间件处理（next-intl已经内置了静态资源排除逻辑）
    const intlResponse = intlMiddleware(request);
    if (intlResponse) {
        return intlResponse;
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

    return NextResponse.next()
}

// 保持middleware作为别名，兼容旧代码
export {proxy as middleware}

// 配置matcher：排除API、_next、静态资源文件（如favicon.ico, robots.txt等）
export const config = {
    matcher: [
        // 匹配所有路径，但排除API路由、Next.js内部路由和静态资源
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|image/|tem/).*)'
    ],
}