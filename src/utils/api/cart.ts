// src/utils/api/cart.ts
import {get, post} from "@utils/request/request";
import {Cart, CartItem} from "@/types/api/trade/cart";


interface CartListResponse {
  validList: CartItem[];
  invalidList: CartItem[];
}

// 获取购物车信息
export async function getCartInfo(): Promise<Cart> {
  const response = await get<CartListResponse>("trade/cart/list");

  // 转换新的响应结构为旧的 Cart 类型
  const validItems = response.validList || [];
  const itemsQty = validItems.reduce((total, item) => total + item.count, 0);
  const grandTotal = validItems.reduce((total, item) => total + (item.sku.price * item.count), 0);

  // 构建符合 Cart 类型的对象
  const cart: Cart = {
    id: 1, // 假设购物车 ID 为 1
    itemsQty,
    taxAmount: 0, // 暂时设为 0
    shippingAmount: 0, // 暂时设为 0
    grandTotal,
    items: validItems,
    paymentMethod: "",
    paymentMethodTitle: "",
    shippingMethod: null,
    selectedShippingRate: null,
    selectedShippingRateTitle: "",
    deliveryType: 1,
    receiveUseBilling: true,
    businessUseBilling: true,
  };

  return cart;
}

// 添加商品到购物车
export async function addToCart(skuId: number, count: number): Promise<{ code: number; msg: string; data: number }> {
  return post<{ code: number; msg: string; data: number }>("trade/cart/add", {
    skuId,
    count
  });
}

// 从购物车移除商品
export async function removeFromCart(cartItemId: number): Promise<any> {
  return post<any>("trade/cart/remove", {
    cartItemId
  });
}

// 更新购物车商品数量
export async function updateCartItem(cartItemId: number, quantity: number): Promise<any> {
  return post<any>("trade/cart/update", {
    cartItemId,
    quantity
  });
}
