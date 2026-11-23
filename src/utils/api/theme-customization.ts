import {cachedRestGet} from "@utils/request/useCahceRest";
import type {ThemeSectionsResponse} from "@/types/theme/theme-customization";

/**
 * 从 RuoYi 后端拉取首页区块配置（服务端组件专用，带缓存）
 *
 * @param params.pageCode  默认 "home"
 * @param params.themeCode 默认 "default"
 * @param params.locale    当前语言（middleware 注入，如 "en-US"）
 * @returns 聚合好的 sections，或后端不可达时返回 null（由调用方兜底）
 */
export async function getHomeSections(params: {
    pageCode?: string;
    themeCode?: string;
    locale: string;
}): Promise<ThemeSectionsResponse | null> {
    try {
        const data = await cachedRestGet<ThemeSectionsResponse>(
            "theme",
            "promotion/theme-customization/list",
            {
                pageCode: params.pageCode ?? "home",
                themeCode: params.themeCode ?? "default",
                locale: params.locale,
            },
        );
        return data;
    } catch (err) {
        // 后端不可达 / 接口报错 → 上层用 DEFAULT_HOME_SECTIONS 兜底，不抛
        if (process.env.NODE_ENV !== "production") {
            console.warn("[theme-customization] backend unavailable, using fallback sections:", err);
        }
        return null;
    }
}
