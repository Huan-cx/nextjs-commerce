import {get} from "@utils/request/request";
import {AppArticle, FooterColumns} from "@/types/api/promotion/type";


export async function getFooterArticleList(): Promise<FooterColumns> {
  return get<FooterColumns>("promotion/article/footer");
}


export async function getArticle(params: { title: string }): Promise<AppArticle> {
  return get<AppArticle>("promotion/article/get", {title: params.title});
}