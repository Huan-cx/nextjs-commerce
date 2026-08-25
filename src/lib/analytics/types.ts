/**
 * 统一事件参数类型
 * 所有像素平台共用这套类型，index.ts 负责映射到各平台字段
 */

/** 通用事件参数（可附加任意键值） */
export interface EventProps {
  [key: string]: any;
}

/** 电商商品项 */
export interface EcommerceItem {
  product_id?: string | number;
  productId?: string | number;
  name?: string;
  category?: string;
  brand?: string;
  price?: number;
  quantity?: number;
  variant?: string;
}

/** 页面浏览参数 */
export interface PageViewParams {
  path: string;
  title?: string;
  locale?: string;
  referrer?: string;
}

/** 电商事件基类 */
export interface EcommerceBase {
  value?: number;
  currency?: string;
  items?: EcommerceItem[];
}

/** 购买完成事件 */
export interface PurchaseParams extends EcommerceBase {
  order_id?: string;
  orderId?: string;
  transaction_id?: string;
}

/** 加购事件 */
export interface AddToCartParams extends EcommerceBase {
  product_id?: string | number;
  productId?: string | number;
  quantity?: number;
  price?: number;
}

/** 发起结算事件 */
export type BeginCheckoutParams = EcommerceBase;

/** 查看商品事件 */
export interface ViewItemParams extends EcommerceBase {
  product_id?: string | number;
  productId?: string | number;
  name?: string;
  price?: number;
  category_id?: number | string;
  categoryId?: number | string;
}

/** 登录事件 */
export interface LoginParams {
  method?: string;
}

/** 注册事件 */
export interface SignUpParams {
  method?: string;
}

/** 搜索事件 */
export interface SearchParams {
  search_term?: string;
  searchTerm?: string;
}

/** 支持的事件名 */
export type AnalyticsEventName =
    | 'page_view'
    | 'view_item'
    | 'add_to_cart'
    | 'remove_from_cart'
    | 'begin_checkout'
    | 'add_payment_info'
    | 'purchase'
    | 'login'
    | 'sign_up'
    | 'search'
    | 'view_cart'
    | string;
