import {get, post} from "@utils/request/request";
import {AddressLine} from "@/types/api/address/type";
import {Spu} from "@/types/api/product/type";

// 订单结算信息响应类型
interface OrderSettlementItem {
  id: number;
  count: number;
  sku: {
    id: number;
    price: number;
    properties: { propertyName: string; valueName: string }[];
  };
  spu: Spu;
}

interface OrderSettlementPrice {
  totalPrice: number;
  discountPrice: number;
  deliveryPrice: number;
  couponPrice: number;
  pointPrice: number;
  vipPrice: number;
  payPrice: number;
}

export interface OrderSettlement {
  items: OrderSettlementItem[];
  price: OrderSettlementPrice;
  receiverAddress: AddressLine;
  billingAddress: AddressLine;
  businessAddress: AddressLine;
  shippingAmount: number;
  taxAmount: number;
  grandTotal: number;
}

// 获得订单结算信息
export async function getOrderSettlement(request: SubmitOrderRequest): Promise<OrderSettlement> {
  return await post<OrderSettlement>('trade/order/settlement', request, {
    contentType: true,
    requiresAuth: true
  });
}


// 提交订单请求类型
export interface SubmitOrderItem {
  skuId: number;
  count: number;
  cartId?: number;
}

export interface SubmitOrderRequest {
  items: SubmitOrderItem[];
  deliveryType?: number | null;
  receiverAddress?: AddressLine | null;
  billingAddress?: AddressLine | null;
  businessAddress?: AddressLine | null;
  receiveUseBilling?: boolean;
  businessUseBilling?: boolean;
  couponId: number | null;
  pointStatus?: boolean;
  paymentMethod?: number | null;
  remark?: string;
}

// 提交订单响应类型
export interface SubmitOrderResponse {
  payOrderId: number;
}

// 提交订单
export async function submitOrder(request: SubmitOrderRequest): Promise<SubmitOrderResponse> {
  return await post<SubmitOrderResponse>('trade/order/create', request, {
    contentType: true,
    requiresAuth: true
  });
}

// 支付方式响应类型
export interface PaymentChannel {
  id: number;
  code: string;
  remark: string;
}

// 获取支付方式
export async function getPaymentChannels(params: { appId: string }): Promise<PaymentChannel[]> {
  return await get<PaymentChannel[]>('pay/channel/get-enable-code-list', params, {
    contentType: 'urlencoded',
    requiresAuth: true,
  });
}

export interface ShippingChannel {
  id: number;
  name: string;
  description: string;
  price: number;
}

// 获取配送方式
export async function getShippingChannels(): Promise<ShippingChannel[]> {
  return await get<ShippingChannel[]>('trade/delivery/express/list', undefined, {
    contentType: 'urlencoded',
  });
}

// 合并购物车请求类型
export interface MergeCartRequest {
  items: {
    skuId: number;
    count: number;
  }[];
}

// 合并购物车
export async function mergeCart(request: MergeCartRequest): Promise<boolean> {
  return await post<boolean>('trade/cart/merge', request, {
    contentType: true
  });
}

// 创建商品评价请求类型
export interface CreateProductReviewRequest {
  anonymous: boolean;
  orderItemId: number;
  descriptionScores: number;
  benefitScores: number;
  content: string;
  picUrls: string[];
}

// 创建商品评价
export async function createProductReview(request: CreateProductReviewRequest): Promise<number> {
  return await post<number>('trade/order/item/create-comment', request, {
    contentType: true,
    requiresAuth: true,
  });
}

// ======================= 订单列表 API =======================

// 订单项响应类型
export interface OrderItem {
  id: number;
  orderId: number;
  spuId: number;
  spuName: string;
  skuId: number;
  properties: {
    propertyId: number;
    propertyName: string;
    valueId: number;
    valueName: string;
  }[];
  picUrl: string;
  count: number;
  commentStatus: boolean;
  price: number;
  payPrice: number;
  afterSaleId: number;
  afterSaleStatus: number;
}

// 订单地址响应类型
export interface OrderAddress {
  firstName: string;
  lastName: string;
  companyName: string;
  address: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  email: string;
  phone: string;
  vat: string;
  eori: string;
}

// 订单详情响应类型
export interface OrderDetail {
  id: number;
  no: string;
  type: number;
  createTime: string;
  userRemark: string;
  status: number;
  productCount: number;
  finishTime: string;
  cancelTime: string;
  commentStatus: boolean;
  payStatus: boolean;
  payOrderId: number;
  payTime: string;
  payExpireTime: string;
  payChannelCode: string;
  payChannelName: string;
  totalPrice: number;
  discountPrice: number;
  deliveryPrice: number;
  adjustPrice: number;
  payPrice: number;
  deliveryType: number;
  logisticsId: number;
  logisticsName: string;
  logisticsNo: string;
  deliveryTime: string;
  receiveTime: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: OrderAddress;
  billingAddress: OrderAddress;
  businessAddress: OrderAddress;
  pickUpStoreId: number;
  pickUpVerifyCode: string;
  refundStatus: number;
  refundPrice: number;
  couponId: number;
  couponPrice: number;
  pointPrice: number;
  vipPrice: number;
  combinationRecordId: number;
  items: OrderItem[];
}

// 订单列表项响应类型
export interface OrderListItem {
  id: number;
  no: string;
  type: number;
  status: number;
  productCount: number;
  commentStatus: boolean;
  createTime: string;
  payOrderId: number;
  payPrice: number;
  deliveryType: number;
  combinationRecordId: number;
}

// 订单列表响应类型
export interface OrderListResponse {
  total: number;
  list: OrderListItem[];
}

// 获取订单列表请求类型
export interface GetOrdersRequest {
  pageNo: number;
  pageSize: number;
  status?: number;
  commentStatus?: boolean;
}

// 获取订单列表
export async function getOrders(request: GetOrdersRequest): Promise<OrderListResponse> {
  return await get<OrderListResponse>('trade/order/base/page', request, {
    contentType: 'urlencoded',
    requiresAuth: true,
  });
}

// 获取订单详情
export async function getOrderDetail(id: number, sync?: boolean): Promise<OrderDetail> {
  return await get<OrderDetail>('trade/order/get-detail', {id, sync}, {
    contentType: 'urlencoded',
    requiresAuth: true,
  });
}