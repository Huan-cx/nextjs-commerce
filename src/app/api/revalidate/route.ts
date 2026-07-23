import {revalidatePath, revalidateTag} from "next/cache";
import {NextRequest, NextResponse} from "next/server";

/**
 * 清除 Next.js 服务端缓存
 *
 * 调用方式：POST /api/revalidate
 * Body: { "paths": ["/"] } 或 { "tags": ["products"] }
 *
 * 可选认证：配置 REVALIDATE_SECRET 环境变量后，需在 Header 传 x-revalidate-token
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        // 可选的 token 认证（配置了才校验）
        const secret = process.env.REVALIDATE_SECRET;
        if (secret) {
            const token = req.headers.get("x-revalidate-token");
            if (token !== secret) {
                return NextResponse.json(
                    {revalidated: false, error: "Unauthorized"},
                    {status: 401},
                );
            }
        }

        const body = await req.json().catch(() => ({}));
        const paths: string[] = Array.isArray(body?.paths) ? body.paths : [];
        const tags: string[] = Array.isArray(body?.tags) ? body.tags : [];

        // 默认清除所有产品相关缓存标签
        if (paths.length === 0 && tags.length === 0) {
            tags.push("all-products", "products", "categories", "home-page", "search-results");
        }

        // 1. 清除 Next.js Full Route Cache（页面 HTML 缓存）
        paths.forEach((p) => revalidatePath(p, "layout"));

        // 2. 清除 Data Cache（通过标签）
        tags.forEach((t) => revalidateTag(t, "max"));

        return NextResponse.json({
            revalidated: true,
            now: Date.now(),
            paths,
            tags,
        });
    } catch (err) {
        return NextResponse.json(
            {revalidated: false, error: String(err)},
            {status: 500},
        );
    }
}
