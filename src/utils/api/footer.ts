import {get} from "@utils/request/request";
import {AppArticle, FooterColumns} from "@/types/api/promotion/type";


export async function getFooterArticleList(): Promise<FooterColumns> {
  return get<FooterColumns>("promotion/article/footer");
}


export async function getArticle(params: { title: string }): Promise<AppArticle> {
  return get<AppArticle>("promotion/article/get", {title: params.title});
}

/* 通过slug获取文章详情 */
export async function getArticleBySlug(params: { slug: string }): Promise<AppArticle> {
  return get<AppArticle>(`promotion/article/get-by-slug?slug=${params.slug}`);
}

/* 增加文章浏览量 */
export async function incrementArticleView(params: { id: number }): Promise<void> {
  return get<void>(`promotion/article/add-browse-count?id=${params.id}`);
}