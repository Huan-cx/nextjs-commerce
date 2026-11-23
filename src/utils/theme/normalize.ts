import type {
    ThemeCustomizationResponse,
    ThemeCustomizationType,
    ThemeSection,
    ThemeSectionsResponse,
} from "@/types/theme/theme-customization";

/**
 * 双读适配层：同时接受新 API 结构与旧 Bagisto JSON 结构，
 * 统一归一化到 ThemeSection[]，供渲染层无差别消费。
 *
 * 作用：后端还没就绪时，前端单靠旧 JSON 也能跑；后端就绪后自动切到新 API。
 * 不做类型检测时建议显式调用：normalizeSections(apiResp ?? oldJson)。
 */
export function normalizeSections(
    input: ThemeSectionsResponse | ThemeCustomizationResponse | null | undefined,
): ThemeSection[] {
    if (!input) return [];

    // 新 API 结构：有 sections 字段
    if ("sections" in input && Array.isArray(input.sections)) {
        return input.sections
            .filter((s) => s && typeof s === "object")
            .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    }

    // 旧 Bagisto JSON 结构：有 themeCustomizations 字段
    if ("themeCustomizations" in input) {
        const oldResp = input as ThemeCustomizationResponse;
        if (!Array.isArray(oldResp.themeCustomizations)) return [];
        return oldResp.themeCustomizations
            .filter((node) => node && node.type && node.status === "1")
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((node) => {
                const t = node.translations?.[0];
                const rawOpts: Record<string, unknown> =
                    (t?.options as Record<string, unknown>) ?? {};

                // 从 filters.order 推断 layout（旧 JSON 里没有 layout 字段）
                let layout: ThemeSection["layout"] = null;
                if (node.type === "product_carousel") {
                    // 旧 sortOrder===2 → featured3；其他 → grid4
                    layout = node.sortOrder === 2 ? "featured3" : "grid4";
                }

                // product_carousel / category_carousel 的 filters 放 config.filters
                const config: Record<string, unknown> = {};
                if (node.type === "product_carousel" || node.type === "category_carousel") {
                    config.filters = (rawOpts.filters as Record<string, unknown>) ?? {};
                }

                return {
                    id: Number(node.id) || 0,
                    type: node.type as ThemeCustomizationType,
                    name: node.name,
                    sort: node.sortOrder ?? 0,
                    layout,
                    config,
                    translation: {
                        locale: t?.locale ?? "en-US",
                        fallback: false,
                        title:
                            typeof rawOpts.title === "string"
                                ? rawOpts.title
                                : null,
                        subtitle: null,
                        content: null,
                    },
                } satisfies ThemeSection;
            });
    }

    return [];
}
