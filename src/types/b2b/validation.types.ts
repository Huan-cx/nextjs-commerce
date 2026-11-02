/**
 * B2B 表单验证类型定义
 */

import type {FieldErrors, RegisterOptions} from 'react-hook-form';

// 字段验证规则配置
export interface FieldValidationRule {
  name: string;
  label: string;
  required?: boolean;
  requiredMessage?: string;
  pattern?: RegExp;
  patternMessage?: string;
  minLength?: number;
  maxLength?: number;
  custom?: (value: any, formData: any) => string | null;
}

// 表单字段定义
export interface FormFieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date' | 'phone';
  placeholder?: string;
  validation?: RegisterOptions;
  colSpan?: string;
  options?: Array<{ value: string; label: string }>;
}

// 地址表单字段配置
export const ADDRESS_FIELD_CONFIGS: FormFieldDefinition[] = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'Enter first name',
    colSpan: 'col-span-6 xxs:col-span-3 mb-4',
    validation: {
      required: 'First name is required',
      minLength: {value: 2, message: 'Minimum 2 characters'},
    },
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Enter last name',
    colSpan: 'col-span-6 xxs:col-span-3 mb-4',
    validation: {
      required: 'Last name is required',
      minLength: {value: 2, message: 'Minimum 2 characters'},
    },
  },
  {
    name: 'companyName',
    label: 'Company Name',
    type: 'text',
    placeholder: 'Enter company name (optional)',
    colSpan: 'col-span-6 mb-2',
    validation: {},
  },
  {
    name: 'vat',
    label: 'VAT Number',
    type: 'text',
    placeholder: 'Enter VAT number (optional)',
    colSpan: 'col-span-6 xxs:col-span-3 mb-2',
    validation: {},
  },
  {
    name: 'eori',
    label: 'EORI Number',
    type: 'text',
    placeholder: 'Enter EORI number (optional)',
    colSpan: 'col-span-6 xxs:col-span-3 mb-2',
    validation: {},
  },
  {
    name: 'address',
    label: 'Address Line 1',
    type: 'text',
    placeholder: 'Enter address',
    colSpan: 'col-span-6 mb-4',
    validation: {
      required: 'Address is required',
      minLength: {value: 5, message: 'Minimum 5 characters'},
    },
  },
  {
    name: 'street',
    label: 'Address Line 2',
    type: 'text',
    placeholder: 'Enter street (optional)',
    colSpan: 'col-span-6 mb-4',
    validation: {},
  },
  {
    name: 'country',
    label: 'Country',
    type: 'select',
    colSpan: 'col-span-6 xxs:col-span-3 mb-4',
    validation: {
      required: 'Country is required',
    },
  },
  {
    name: 'state',
    label: 'State / Province',
    type: 'text',
    placeholder: 'Enter state',
    colSpan: 'col-span-6 xxs:col-span-3 mb-4',
    validation: {
      required: 'State is required',
    },
  },
  {
    name: 'city',
    label: 'City',
    type: 'text',
    placeholder: 'Enter city',
    colSpan: 'col-span-6 xxs:col-span-3 mb-4',
    validation: {
      required: 'City is required',
    },
  },
  {
    name: 'postcode',
    label: 'Postal Code',
    type: 'text',
    placeholder: 'Enter postal code',
    colSpan: 'col-span-6 xxs:col-span-3 mb-4',
    validation: {
      required: 'Postal code is required',
    },
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'phone',
    placeholder: 'Enter phone number',
    colSpan: 'col-span-6 mb-4',
    validation: {
      required: 'Phone number is required',
      pattern: {
        value: /^[\d\s\-+()]{8,}$/i,
        message: 'Please enter a valid phone number',
      },
    },
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter email address',
    colSpan: 'col-span-6 mb-4',
    validation: {
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Please enter a valid email address',
      },
    },
  },
];

// 询价单字段配置
export const RFQ_FIELD_CONFIGS: FormFieldDefinition[] = [
  {
    name: 'contactName',
    label: 'Contact Name',
    type: 'text',
    placeholder: 'Enter contact name',
    validation: {
      required: 'Contact name is required',
      minLength: {value: 2, message: 'Minimum 2 characters'},
    },
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter email address',
    validation: {
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Please enter a valid email address',
      },
    },
  },
  {
    name: 'incoterms',
    label: 'Incoterms',
    type: 'select',
    validation: {
      required: 'Incoterms is required',
    },
  },
  {
    name: 'deliveryPort',
    label: 'Destination / Delivery Port',
    type: 'text',
    placeholder: 'e.g., France, Port of Marseille',
    validation: {
      required: 'Destination / Delivery Port is required',
    },
  },
  {
    name: 'expectedDeliveryType',
    label: 'Expected Delivery',
    type: 'select',
    validation: {},
  },
  {
    name: 'targetCurrency',
    label: 'Currency',
    type: 'select',
    validation: {},
  },
  {
    name: 'targetPrice',
    label: 'Target Price',
    type: 'number',
    placeholder: 'Enter target price',
    validation: {},
  },
  {
    name: 'targetPriceUnit',
    label: 'Price Unit',
    type: 'select',
    validation: {},
  },
  {
    name: 'requirement',
    label: 'Requirements',
    type: 'textarea',
    placeholder: 'Enter your special requirements (optional)',
    validation: {},
  },
];

// 验证结果类型
export type ValidationResult = {
  isValid: boolean;
  errors: FieldErrors<any>;
};

// 验证上下文
export interface ValidationContext {
  t: (key: string) => string;
  formData: any;
}
