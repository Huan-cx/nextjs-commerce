import {get} from "@utils/request/request";
import {Category, Spu} from "@/types/api/product/type";
import {PageResult} from "@/types/api/response/type";

/**
 * 获取商品分页列表
 * @param params
 */
export async function getSpuPage(params: {
  pageNo?: number;
  pageSize?: number;
  ids?: number[];
  categoryId?: number;
  categoryIds?: number[];
  keyword?: string;
  sortField?: string;
  sortAsc?: boolean;
}): Promise<PageResult<Spu>> {
  return get<PageResult<Spu>>("product/spu/page", params, {
    // contentType: 'urlencoded'
  });
}

/* 获取商品分类列表 */
export async function getCategoryPage(params: {
  name?: string;
  status?: number;
  parentId?: number;
  parentIds?: number[];
}): Promise<Category[]> {
  return get<Category[]>("product/category/list", params);
}

/* 获取商品详情 */
export async function getProductSpu(params: {
  id: number;
}): Promise<Spu> {
  return get<Spu>(`product/spu/get-detail?id=${params.id}`);
}

/* 获取商品分类树形结构 */
export async function getCategoryTree(): Promise<Category[]> {
  return get<Category[]>("product/category/tree");
}

/**
 * 根据 SKU ID 获取完整的产品信息（包括 SPU 和 SKU）
 * @param skuId SKU 的 ID
 */
export async function getProductInfoBySkuId(skuId: number): Promise<{ spu: Spu; sku: any }> {
  // 注意：我们假设后端提供了这样一个端点。
  // 'any' 类型应替换为实际的 ProductSku 类型。
  return get<{ spu: Spu; sku: any }>(`product/sku/get-detail?id=${skuId}`);
}