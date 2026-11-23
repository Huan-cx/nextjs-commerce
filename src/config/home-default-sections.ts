import type {ThemeSection} from "@/types/theme/theme-customization";

/**
 * 首页兜底区块配置。
 *
 * 触发条件：
 *  - 后端接口失败 / 返回空 sections
 *  - normalize 发现无法映射
 *
 * Banner 独立由 PromotionBanner 管理，这里不再兜底 image_carousel。
 * product_carousel / category_carousel 兜底数据无 Admin 配置的 productIds/categoryIds，
 * 前端组件的 fallback 分支会自动走动态排序查询。
 */
export const DEFAULT_HOME_SECTIONS: ThemeSection[] = [
    {
        id: 1,
        type: "product_carousel",
        name: "Featured Products",
        sort: 1,
        layout: "featured3",
        config: {
            sortField: "salesCount",
            sortAsc: false,
        },
        translation: {
            locale: "en-US",
            fallback: false,
            title: "Featured Products",
            subtitle: "Best sellers this week",
            content: null,
        },
    },
    {
        id: 2,
        type: "category_carousel",
        name: "Shop by Category",
        sort: 2,
        layout: null,
        config: {},
        translation: {
            locale: "en-US",
            fallback: false,
            title: "Shop by Category",
            subtitle: "Browse our main collections",
            content: null,
        },
    },
    {
        id: 3,
        type: "product_carousel",
        name: "New Arrivals",
        sort: 3,
        layout: "grid4",
        config: {
            sortField: "createTime",
            sortAsc: false,
        },
        translation: {
            locale: "en-US",
            fallback: false,
            title: "New Arrivals",
            subtitle: "Just landed",
            content: null,
        },
    },
];
