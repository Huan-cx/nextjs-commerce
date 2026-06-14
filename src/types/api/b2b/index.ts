// ==================== 询价单 (RFQ) ====================

export type {
  B2BRfqItem,
  B2BRfqDetail,
  B2BRfqListResponse,
  CreateRfqRequest,
  B2BQuotationItem,
  B2BQuotationFeeItem,
  B2BQuotationDetail,
  AppB2BFinalQuotationItem,
  AppB2BFinalQuotationRespVO,
  B2BOrderDetail,
  B2BOrderListResponse,
} from '@utils/api/b2b';

// 询价单外部状态枚举（客户视角）
export enum RfqStatus {
  INQUIRING = 1,   // 询价中
  QUOTED = 2,      // 已报价
  EXPIRED = 3,     // 已过期（包含已拒绝）
  CANCELED = 4,    // 已取消
  ORDERED = 5,     // 已下单（单独标签）
}

// 报价单状态枚举
export enum QuotationStatus {
  PENDING = 0,
  QUOTED = 10,
  ACCEPTED = 20,
  REJECTED = 30,
  EXPIRED = 40,
}

// B2B订单审批状态枚举
export enum B2BOrderApprovalStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}

// B2B订单付款进度状态枚举
export enum B2BOrderPayProgressStatus {
  PENDING = 0,
  PARTIAL_PAID = 1,
  FULL_PAID = 2,
}

// 订单状态枚举 - 与现有系统保持一致
export enum OrderStatus {
  PENDING = 0,
  UNPAID = 10,
  SHIPPED = 20,
  COMPLETED = 30,
  CANCELED = 40,
}
