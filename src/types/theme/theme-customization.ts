export interface ThemeTranslationNode {
  id: string;
  themeCustomizationId: string;
  locale: string;
  options: object;
}

export interface ThemeCustomizationResponse {
  themeCustomizations: Array<{
    id: string;
    type: string;
    name: string;
    status: string;
    sortOrder: number;
    themeCode?: string;
    translations: ThemeTranslationNode[];
  }>;
}

// ===== 新 API 类型（对接 RuoYi 后端 AppThemeCustomizationController）=====

export type ThemeCustomizationType =
    | "image_carousel"
    | "product_carousel"
    | "category_carousel"
    | "static_content";

export type ThemeLayout = "featured3" | "grid4" | "grid8" | null;

/** 后端已填充好的 Banner 简要（image_carousel 专用，Service 层自动注入） */
export interface ThemeBannerBrief {
  id: number;
  title: string;
  url: string;
  picUrl: string;
}

/** 后端已填充好的商品简要（product_carousel 专用，App 接口返回） */
export interface ThemeProductBrief {
  id: number;
  name: string;
  picUrl?: string;
  price?: number;
  originalPrice?: number;
  salesCount?: number;
}

/** 后端已填充好的分类简要（category_carousel 专用，App 接口返回） */
export interface ThemeCategoryBrief {
  id: number;
  name: string;
  picUrl?: string;
  slug?: string;
}

/** 归一化后的首页区块（渲染层统一消费这个结构） */
export interface ThemeSection {
  id: number;
  type: ThemeCustomizationType;
  name: string;
  sort: number;
  layout: ThemeLayout;
  config: Record<string, unknown>;
  translation: {
    locale: string;
    /** 后端走了回落链：true 表示当前 locale 不是精确匹配 */
    fallback: boolean;
    title?: string | null;
    subtitle?: string | null;
    content?: Record<string, unknown> | null;
  };
  /** image_carousel 专用：后端 Service 层从 PromotionBanner 自动注入 */
  banners?: ThemeBannerBrief[];
  /** product_carousel 专用：后端已填充好的商品列表（按 config.productIds 顺序） */
  products?: ThemeProductBrief[];
  /** category_carousel 专用：后端已填充好的分类列表（按 config.categoryIds 顺序） */
  categories?: ThemeCategoryBrief[];
}

/** 后端 `/app-api/promotion/theme-customization/list` 响应 */
export interface ThemeSectionsResponse {
  pageCode: string;
  themeCode: string;
  requestedLocale: string;
  defaultLocale: string;
  sections: ThemeSection[];
}

// footer 
export interface ThemeOptions {
  title: string;
  url: string;
  picUrl?: string;
  sortOrder?: string;
  slug?: string;
  translations?: Array<{
    locale: string;
    title: string;
    slug: string;
  }>;
}
export interface FooterColumns {
  column_1?: ThemeOptions[];
  column_2?: ThemeOptions[];
  column_3?: ThemeOptions[];
}
export interface GetFooterResponse {
  themeCustomizations: ThemeCustomizationConnection;
}

export interface GetFooterVariables {
  type?: string;
}
export interface ThemeCustomizationConnection {
  edges: ThemeCustomizationEdge[];
}

export interface ThemeCustomizationEdge {
  node: ThemeCustomizationFooterNode;
}

export interface ThemeCustomizationFooterNode {
  id: string;
  type: string;
  name: string;
  status: boolean;
  themeCode?: string;
  translations: ThemeCustomizationTranslationConnection;
}
export interface ThemeCustomizationTranslationConnection {
  edges: ThemeCustomizationTranslationEdge[];
}

export interface ThemeCustomizationTranslationNode {
  id: string;
  themeCustomizationId: string;
  locale: string;
  options: string | FooterColumns;
}


export interface ThemeCustomizationTranslationEdge {
  node: ThemeCustomizationTranslationNode;
}
export interface FooterMenuProps {
  menu: ThemeCustomizationEdge[];
}

export interface ThemeCustomizationResult {
  footer_links: GetFooterResponse | null;
  services_content: GetFooterResponse | null;
}



// Theme Customization Options Types

export interface ProductCarouselOptions {
  title?: string;
  filters: {
    sort?: string;
    limit?: string | number;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface CategoryCarouselOptions {
  filters: Record<string, string | number | boolean | undefined>;
}

export interface StaticContentOptions {
  html: string;
  css?: string;
}

export type RenderableThemeOptions =
  | ProductCarouselOptions
  | CategoryCarouselOptions
  | StaticContentOptions;



  // Page Translation Types

  export interface PageTranslation {
  id: string;
  metaTitle?: string;
  pageTitle?: string;
  urlKey: string;
  htmlContent?: string;
  cmsPageId: string;
}

export interface PageData {
  id: string;
  updatedAt: string;
  translation: PageTranslation;
}