// src/utils/api/cart.ts
import {del, get, post, put} from "@utils/request/request";
import {Cart, CartItem} from "@/types/api/trade/cart";


// 定义合并购物车请求的条目类型
export interface MergeCartItem {
  skuId: number;
  count: number;
}

interface CartListResponse {
  validList?: CartItem[];
  invalidList?: CartItem[];
}

// 获取购物车信息
export async function getCartInfo(): Promise<Cart> {
  const response = await get<CartListResponse>("trade/cart/list", {}, {requiresAuth: true});
  // 转换新的响应结构为旧的 Cart 类型
  const validItems = response?.validList || [];
  const itemsQty = validItems?.reduce((total, item) => total + item.count, 0);
  const totalPrice = validItems?.reduce((total, item) => total + (item.sku.price * item.count), 0);

  // 构建符合 Cart 类型的对象
  return {
    id: 1, // 假设购物车 ID 为 1
    itemsQty,
    totalPrice,
    items: validItems
  };
}

// 添加商品到购物车
export async function addToCart(skuId: number, count: number): Promise<{ code: number; msg: string; data: number }> {
  return post<{ code: number; msg: string; data: number }>("trade/cart/add", {
    skuId,
    count
  }, {requiresAuth: true});
}

// 从购物车移除商品
export async function removeFromCart(ids: number[]): Promise<boolean> {
  return await del<boolean>("trade/cart/delete", {
    ids
  }, {requiresAuth: true});
}

// 更新购物车商品数量
export async function updateCartItem(id: number, count: number): Promise<boolean> {
  return await put<boolean>("trade/cart/update-count", {
    id,
    count
  }, {requiresAuth: true});
}

// 批量获取购物车商品 SKU 信息（主要用于游客购物车）
export async function getCartSkuInfo(skuIds: number[]): Promise<CartItem[]> {
  return get<CartItem[]>("trade/cart/sku/info", {skuIds, requiresAuth: false});
}

// 合并购物车（用户登录时）
export async function mergeCart(items: MergeCartItem[]): Promise<boolean> {
  return post<boolean>("trade/cart/merge", {items}, {requiresAuth: true});
}