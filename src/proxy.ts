import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {getToken} from 'next-auth/jwt'
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NEXTAUTH_SECURE_TOKEN, NEXTAUTH_TOKEN} from '@/utils/constants';

// 静态资源文件扩展名（通用检测：路径以扩展名结尾的直接放行）
const STATIC_FILE_REGEX = /\.[a-zA-Z0-9]+$/;

// 创建国际化中间件
const intlMiddleware = createMiddleware(routing);

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

// 配置matcher：仅排除系统路径，静态资源在函数体内通用处理
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image).*)'
    ],
}