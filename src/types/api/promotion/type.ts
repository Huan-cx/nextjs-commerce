export interface I18nArticleVO {
  locale: string;  // 语言代码，如 zh-CN, en-US, fr-FR
  title: string;         // 标题翻译
  introduction: string;  // 简介翻译
  content: string;       // 内容翻译
  slug: string;          // URL友好名称翻译
  metaTitle?: string;    // SEO标题翻译
  metaDescription?: string; // SEO描述翻译
}

export interface AppArticle {
  /*文章编号 */
  id: number;

  /*文章标题 */
  title: string;

  /*文章作者 */
  author: string;

  /*分类编号 */
  categoryId: number;

  /*图文封面 */
  picUrl: string;

  /*文章简介 */
  introduction: string;

  /*文章内容 */
  content: string;

  /*发布时间 */
  createTime: Record<string, unknown>;

  /*浏览量 */
  browseCount: number;

  /*关联的商品 SPU 编号 */
  spuId: number;

  /*多语言翻译列表 */
  translations?: I18nArticleVO[];

  /*SEO标题 */
  metaTitle?: string;

  /*SEO描述 */
  metaDescription?: string;

  /*URL友好名称 */
  slug?: string;
}

export interface FooterColumns {
  column_1?: AppArticle[];
  column_2?: AppArticle[];
  column_3?: AppArticle[];
}