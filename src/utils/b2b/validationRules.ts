/**
 * B2B 表单统一验证规则
 */

import type {RegisterOptions} from 'react-hook-form';

// 邮箱验证正则
export const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// 电话验证正则
export const PHONE_PATTERN = /^[\d\s\-+()]{8,}$/i;

// 邮编验证正则（通用格式，不同国家可覆盖）
export const POSTCODE_PATTERN = /^[\w\s-]{3,}$/i;

/**
 * 生成必填验证规则
 *
 * @param message - 错误提示信息
 */
export const requiredRule = (message: string): RegisterOptions => ({
  required: message,
});

/**
 * 生成邮箱验证规则
 *
 * @param message - 错误提示信息
 * @param required - 是否必填
 */
export const emailRule = (
    message: string,
    required = true
): RegisterOptions => ({
  required: required ? message : undefined,
  pattern: {
    value: EMAIL_PATTERN,
    message,
  },
});

/**
 * 生成电话验证规则
 *
 * @param message - 错误提示信息
 * @param required - 是否必填
 */
export const phoneRule = (
    message: string,
    required = true
): RegisterOptions => ({
  required: required ? message : undefined,
  pattern: {
    value: PHONE_PATTERN,
    message,
  },
});

/**
 * 生成长度验证规则
 *
 * @param min - 最小长度
 * @param max - 最大长度
 * @param minMessage - 最小长度提示
 * @param maxMessage - 最大长度提示
 */
export const lengthRule = (
    min?: number,
    max?: number,
    minMessage?: string,
    maxMessage?: string
): RegisterOptions => ({
  ...(min !== undefined && {
    minLength: {value: min, message: minMessage || `Minimum ${min} characters`},
  }),
  ...(max !== undefined && {
    maxLength: {value: max, message: maxMessage || `Maximum ${max} characters`},
  }),
});

/**
 * 地址表单通用验证规则
 */
export const addressValidationRules = {
  firstName: {
    required: 'First name is required',
    minLength: {value: 2, message: 'Minimum 2 characters'},
  },
  lastName: {
    required: 'Last name is required',
    minLength: {value: 2, message: 'Minimum 2 characters'},
  },
  address: {
    required: 'Address is required',
    minLength: {value: 5, message: 'Minimum 5 characters'},
  },
  country: {
    required: 'Country is required',
  },
  city: {
    required: 'City is required',
  },
  postcode: {
    required: 'Postal code is required',
    pattern: {value: POSTCODE_PATTERN, message: 'Please enter a valid postal code'},
  },
  phone: {
    required: 'Phone number is required',
    pattern: {value: PHONE_PATTERN, message: 'Please enter a valid phone number'},
  },
  email: {
    required: 'Email is required',
    pattern: {value: EMAIL_PATTERN, message: 'Please enter a valid email address'},
  },
};

/**
 * 询价单表单验证规则
 */
export const rfqValidationRules = {
  contactName: {
    required: 'Contact name is required',
    minLength: {value: 2, message: 'Minimum 2 characters'},
  },
  email: {
    required: 'Email is required',
    pattern: {value: EMAIL_PATTERN, message: 'Please enter a valid email address'},
  },
  incoterms: {
    required: 'Incoterms is required',
  },
  deliveryPort: {
    required: 'Destination / Delivery Port is required',
  },
};

/**
 * 国际贸易术语选项
 */
export const INCOTERM_OPTIONS = [
  {value: 'FOB', label: 'FOB - Free On Board'},
  {value: 'CIF', label: 'CIF - Cost, Insurance & Freight'},
  {value: 'EXW', label: 'EXW - Ex Works'},
  {value: 'DAP', label: 'DAP - Delivered At Place'},
  {value: 'DDP', label: 'DDP - Delivered Duty Paid'},
  {value: 'DDP_EXCLUDING_VAT', label: 'DDP Excluding VAT'},
  {value: 'UNKNOWN', label: 'Unknown / Supplier Recommendation'},
];

/**
 * 期望交付类型选项
 */
export const DELIVERY_TYPE_OPTIONS = [
  {value: 'ASAP', label: 'As Soon As Possible'},
  {value: 'WITHIN_30_DAYS', label: 'Within 30 Days'},
  {value: 'WITHIN_60_DAYS', label: 'Within 60 Days'},
  {value: 'CUSTOM_DATE', label: 'Custom Date'},
];

/**
 * 币种选项
 */
export const CURRENCY_OPTIONS = [
  {value: 'USD', label: 'USD - US Dollar', symbol: '$'},
  {value: 'EUR', label: 'EUR - Euro', symbol: '€'},
  {value: 'CNY', label: 'CNY - Chinese Yuan', symbol: '¥'},
  {value: 'GBP', label: 'GBP - British Pound', symbol: '£'},
  {value: 'JPY', label: 'JPY - Japanese Yen', symbol: '¥'},
];

/**
 * 价格单位选项
 */
export const PRICE_UNIT_OPTIONS = [
  {value: 'PER_ITEM', label: 'Per Item'},
  {value: 'TOTAL', label: 'Total'},
];

/**
 * 获取选项标签
 *
 * @param options - 选项列表
 * @param value - 选中值
 * @returns 对应的标签
 */
export const getOptionLabel = (
    options: Array<{ value: string; label: string }>,
    value: string | undefined
): string => {
  const option = options.find((opt) => opt.value === value);
  return option?.label || value || '';
};
