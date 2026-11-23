/**
 * B2B 组件统一导出
 *
 * 设计目标：
 * - 统一的视觉风格
 * - 复用的通用组件
 * - 标准化的表单验证
 * - 一致的用户体验
 */

// ============ 通用组件 ============
export {B2BStepper} from './common/B2BStepper';
export type {B2BStepperProps, StepItem} from './common/B2BStepper';

export {B2BItemList} from './common/B2BItemList';
export type {B2BItemListProps, B2BItem} from './common/B2BItemList';

export {B2BPriceSummary} from './common/B2BPriceSummary';
export type {B2BPriceSummaryProps, PriceItem} from './common/B2BPriceSummary';

export {B2BAddressCard} from './common/B2BAddressCard';
export type {B2BAddressCardProps} from './common/B2BAddressCard';

export {B2BActionButtons} from './common/B2BActionButtons';
export type {B2BActionButtonsProps} from './common/B2BActionButtons';


// ============ 表单组件 ============
export {B2BAddressForm} from './forms/B2BAddressForm';
export type {B2BAddressFormProps} from './forms/B2BAddressForm';

export {B2BAddressSelector} from './forms/B2BAddressSelector';
export type {B2BAddressSelectorProps} from './forms/B2BAddressSelector';

export {B2BRfqForm} from './forms/B2BRfqForm';
export type {B2BRfqFormProps} from './forms/B2BRfqForm';

// ============ 流程组件 ============
// TODO: 待实现
// export { QuotationDetail } from './quotation/QuotationDetail';
// export type { QuotationDetailProps } from './quotation/QuotationDetail';
//
// export { OrderConfirmation } from './order/OrderConfirmation';
// export type { OrderConfirmationProps } from './order/OrderConfirmation';

// ============ 工具函数 ============
export * from '../../utils/b2b/addressMapper';
export * from '../../utils/b2b/validationRules';

// ============ 类型定义 ============
export type {
  StepConfig,
  AddressType,
  AddressUsageConfig,
  RfqFormData,
  RfqFlowState,
  QuotationFlowState,
  OrderFlowState,
  IncotermOption,
  DeliveryTypeOption,
  CurrencyOption,
  PriceUnitOption,
  FormErrors,
  StepChangeHandler,
} from '../../types/b2b/flow.types';

export type {
  FieldValidationRule,
  FormFieldDefinition,
  ValidationResult,
  ValidationContext,
} from '../../types/b2b/validation.types';
