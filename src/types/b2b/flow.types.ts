/**
 * B2B 流程状态类型定义
 */

// 通用步骤配置
export interface StepConfig {
  id: string;
  label: string;
  completed: boolean;
  optional?: boolean;
}

// 地址类型枚举
export enum AddressType {
  BILLING = 'billing',
  RECEIVER = 'receiver',
  IMPORTER = 'importer',
}

// 地址使用配置
export interface AddressUsageConfig {
  type: AddressType;
  title: string;
  required: boolean;
  canUseBilling: boolean;
}

// 询价单表单数据
export interface RfqFormData {
  // 联系信息
  contactName: string;
  email: string;
  phone?: string;

  // 地址信息
  country: string;
  city: string;
  postalCode: string;
  address?: string;

  // 国际贸易信息
  incoterms: string;
  deliveryPort: string;

  // 交付时间
  expectedDeliveryType?: string;
  expectedDeliveryDate?: string;

  // 目标价格
  targetCurrency?: string;
  targetPrice?: number;
  targetPriceUnit?: string;

  // 需求说明
  requirement?: string;
}

// 询价单创建状态
export interface RfqFlowState {
  currentStep: number;
  steps: StepConfig[];
  formData: Partial<RfqFormData>;
  selectedAddressId: number | null;
  cartIds: number[];
  submitting: boolean;
}

// 报价单状态
export interface QuotationFlowState {
  quotationId: number | null;
  rfqId: number | null;
  accepted: boolean;
  loading: boolean;
}

// 订单确认状态
export interface OrderFlowState {
  currentStep: 'address' | 'confirm';
  quotationId: number | null;
  remark: string;
  submitting: boolean;
}

// 国际贸易术语选项
export interface IncotermOption {
  value: string;
  label: string;
  description?: string;
}

// 期望交付类型选项
export interface DeliveryTypeOption {
  value: string;
  label: string;
}

// 币种选项
export interface CurrencyOption {
  value: string;
  label: string;
  symbol: string;
}

// 价格单位选项
export interface PriceUnitOption {
  value: string;
  label: string;
}

// 表单验证错误
export interface FormErrors {
  [key: string]: string | undefined;
}

// 步骤变化回调
export type StepChangeHandler = (nextStep: number, currentData: any) => Promise<boolean>;