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
}

export interface FooterColumns {
  column_1?: AppArticle[];
  column_2?: AppArticle[];
  column_3?: AppArticle[];
}