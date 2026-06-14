import {del, get, post} from "@utils/request/client";

// ==================== 询价单 (RFQ) ====================

export interface B2BRfqItem {
  skuId: number;
  spuId: number;
  spuName: string;
  skuName: string;
  picUrl: string;
  count: number;
  expectedPrice?: number;
}

export interface B2BRfqDetail {
  id: number;
  no: string;
  status: number; // 外部状态（1-询价中 2-已报价 3-已过期 4-已取消）
  hasFinalQuotation?: boolean; // 是否有最终报价（已确认比价选择）
  items: B2BRfqItem[];
  requirement?: string;
  country?: string;
  city?: string;
  postalCode?: string;
  contactName: string;
  email: string;
  incoterms?: string;
  deliveryPort?: string;
  expectedDeliveryDate?: string;
  expectedDeliveryType?: string;
  targetCurrency?: string;
  targetPrice?: number;
  targetPriceUnit?: string;
  supplierName?: string;
  validUntil?: string;
  submittedAt?: string;
  createTime: string;
}

export interface B2BRfqListResponse {
  list: B2BRfqDetail[];
  total: number;
  pageNo: number;
  pageSize: number;
}

export interface CreateRfqRequest {
  items?: Array<{
    skuId: number;
    count: number;
    expectedPrice?: number;
  }>;
  requirement?: string;
  country?: string;
  city?: string;
  postalCode?: string;
  contactName: string;
  email: string;
  incoterms: string;
  deliveryPort: string;
  expectedDeliveryDate?: string;
  expectedDeliveryType?: string;
  targetCurrency?: string;
}

// 获取询价单列表 - 修复：GET /page
export async function getRfqList(params: {
  pageNo: number;
  pageSize: number;
  status?: number;
  statusList?: number[];
}): Promise<B2BRfqListResponse> {
  return await get<B2BRfqListResponse>('trade/b2b/rfq/page', params, {
    requiresAuth: true,
  });
}

// 获取询价单详情
export async function getRfqDetail(id: number): Promise<B2BRfqDetail> {
  return await get<B2BRfqDetail>('trade/b2b/rfq/get', {id}, {
    requiresAuth: true,
  });
}

// 创建询价单
export async function createRfq(data: CreateRfqRequest): Promise<{ id: number }> {
  return await post<{ id: number }>('trade/b2b/rfq/create', data, {
    requiresAuth: true,
  });
}

// 取消询价单 - 修复：DELETE
export async function cancelRfq(id: number): Promise<boolean> {
  return await del<boolean>('trade/b2b/rfq/cancel', {id}, {
    requiresAuth: true,
  });
}

// ==================== 报价单 (Quotation) ====================

// 报价单商品项（包含SKU扩展字段）
export interface B2BQuotationItem {
  spuId: number;
  skuId: number;
  spuName: string;
  skuName: string;
  skuCode?: string; // SKU编号/编码
  picUrl?: string;
  count: number;
  unitPrice: number;
  totalPrice: number;
  supplierId?: number;
  supplierName?: string;
  // ========== SKU 扩展字段 ==========
  barCode?: string; // 条形码
  minQty?: number; // 最小起订量
  unit?: string; // 单位
  weight?: number; // 重量，单位：kg
  hsCode?: string; // 海关编码
  packagingWay?: string; // 包装方式
  pcsPerCtn?: number; // 每箱数量(PC/CTN)
  nwPerCtn?: number; // 净重/箱，单位：kg
  gwPerCtn?: number; // 毛重/箱，单位：kg
}

export interface B2BQuotationFeeItem {
  name: string;
  price: number;
}

export interface B2BQuotationDetail {
  id: number;
  rfqId: number;
  supplierId?: number;
  supplierName?: string;
  items: B2BQuotationItem[];
  fees?: B2BQuotationFeeItem[];
  status: number;
  remark?: string;
  validUntil?: string;
  createTime: string;
}

// 最终报价单商品项（包含SKU扩展字段）
export interface AppB2BFinalQuotationItem {
  spuId: number;
  skuId: number;
  spuName: string;
  skuName: string;
  skuCode?: string; // SKU编号/编码
  picUrl?: string;
  count: number;
  unitPrice: number;
  totalPrice: number;
  supplierId?: number;
  supplierName?: string;
  // ========== SKU 扩展字段 ==========
  barCode?: string; // 条形码
  minQty?: number; // 最小起订量
  unit?: string; // 单位
  weight?: number; // 重量，单位：kg
  hsCode?: string; // 海关编码
  packagingWay?: string; // 包装方式
  pcsPerCtn?: number; // 每箱数量(PC/CTN)
  nwPerCtn?: number; // 净重/箱，单位：kg
  gwPerCtn?: number; // 毛重/箱，单位：kg
}

export interface AppB2BFinalQuotationRespVO {
  rfqId: number;
  rfqNo: string;
  totalPrice: number;
  currency: string;
  incoterms?: string;
  validUntil?: string;
  items: AppB2BFinalQuotationItem[];
}

export async function getFinalQuotation(rfqId: number): Promise<AppB2BFinalQuotationRespVO> {
  return await get<AppB2BFinalQuotationRespVO>('trade/b2b/quotation/get-final', {rfqId}, {
    requiresAuth: true,
  });
}

// 接受报价
export async function acceptQuotation(quotationId: number): Promise<boolean> {
  return await post<boolean>('trade/b2b/quotation/accept', {}, {
    params: {rfqId: quotationId},
    requiresAuth: true,
  });
}

// 拒绝报价
export async function rejectQuotation(quotationId: number): Promise<boolean> {
  return await post<boolean>('trade/b2b/quotation/reject', {id: quotationId}, {
    requiresAuth: true,
  });
}

// ==================== 订单 (Order) ====================

// B2B订单商品项（包含SKU扩展字段）
export interface B2BOrderItem {
  spuId: number;
  skuId: number;
  spuName: string;
  skuName: string;
  skuCode?: string; // SKU编号/编码
  picUrl?: string;
  count: number;
  unitPrice: number;
  totalPrice: number;
  // ========== SKU 扩展字段 ==========
  barCode?: string; // 条形码
  minQty?: number; // 最小起订量
  unit?: string; // 单位
  weight?: number; // 重量，单位：kg
  hsCode?: string; // 海关编码
  packagingWay?: string; // 包装方式
  pcsPerCtn?: number; // 每箱数量(PC/CTN)
  nwPerCtn?: number; // 净重/箱，单位：kg
  gwPerCtn?: number; // 毛重/箱，单位：kg
}

export interface B2BOrderDetail {
  id: number;
  orderNo: string;
  status: number;
  totalPrice: number;
  payPrice?: number;
  items: B2BOrderItem[];
  createTime: string;
  payTime?: string;
  deliveryTime?: string;
  receiveTime?: string;
  cancelTime?: string;
  remark?: string;
  receiverName?: string;
  receiverMobile?: string;
  receiverArea?: string;
  receiverDetailAddress?: string;
  deliveryType?: number;
}

export interface B2BOrderListResponse {
  list: B2BOrderDetail[];
  total: number;
  pageNo: number;
  pageSize: number;
}

// 订单地址请求 VO
export interface AppTradeOrderAddressReqVO {
  name?: string; // 姓名
  mobile?: string; // 手机号
  detailAddress?: string; // 详细地址
  country?: string; // 国家
  state?: string; // 省/州
  city?: string; // 城市
  postcode?: string; // 邮编
  email?: string; // 邮箱
  companyName?: string; // 公司名称
  vat?: string; // VAT 税号
  eori?: string; // EORI 号
}

// 创建 B2B 订单请求 - 根据后端 AppB2BOrderCreateReqVO
export interface AppB2BOrderCreateReqVO {
  rfqId?: number; // 询价单ID（与quotationId二选一，优先使用rfqId）
  remark?: string; // 订单备注
  receiveUseBilling: boolean; // 收货地址是否与账单地址相同（必填）
  importerUseBilling: boolean; // 进口商地址是否与账单地址相同（必填）
  billingAddress: AppTradeOrderAddressReqVO; // 账单地址（必填）
  receiverAddress?: AppTradeOrderAddressReqVO; // 收货地址
  importerAddress?: AppTradeOrderAddressReqVO; // 进口商地址
}

export async function createB2BOrder(data: AppB2BOrderCreateReqVO): Promise<{ id: number }> {
  return await post<{ id: number }>('trade/b2b/order/create', data, {
    requiresAuth: true,
  });
}

export async function getB2BOrderDetail(id: number): Promise<B2BOrderDetail> {
  return await get<B2BOrderDetail>('trade/b2b/order/get', {id}, {
    requiresAuth: true,
  });
}

export async function getB2BOrderList(params: {
  pageNo: number;
  pageSize: number;
  status?: number;
}): Promise<B2BOrderListResponse> {
  return await get<B2BOrderListResponse>('trade/b2b/order/page', params, {
    requiresAuth: true,
  });
}

export async function cancelB2BOrder(id: number): Promise<boolean> {
  return await post<boolean>('trade/b2b/order/cancel', {id}, {
    requiresAuth: true,
  });
}

export async function deleteB2BOrder(id: number): Promise<boolean> {
  return await post<boolean>('trade/b2b/order/delete', {id}, {
    requiresAuth: true,
  });
}