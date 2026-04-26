import {Radio} from "@heroui/react";
import {FieldErrors, UseFormRegister} from "react-hook-form";

export type CustomRadioProps = {
  children: React.ReactNode;
  description?: string;
  value: string;
} & typeof Radio.defaultProps;

export type CustomShippingMethodRadioProps = {
  children: React.ReactNode;
  description?: string;
  value: number;
} & typeof Radio.defaultProps;


export type ShippingMethodType = {
  method?: string;
  label?: string;
  price?: number | string;
  code?: string;
};

export type EmailFormValues = { email: string };

export type EmailFormProps = {
  register: UseFormRegister<EmailFormValues>;
  errors: FieldErrors<EmailFormValues>;
  isSubmitting: boolean;
  isGuest: boolean;
};

export interface FieldDefinition {
  name: keyof AddressFormData;
  label: string;
  required: boolean;
  colSpan: string;
  validation?: RegExp;
  isCountry?: boolean;
  isPhone?: boolean;
}

export interface AddressFormData {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  address: string;
  street: string;
  country: string;
  state: string;
  city: string;
  postcode: string;
  phone: string;
  vat: string;
  eori: string;
}

// 表单数据接口
export interface CheckoutFormData {
  billing: AddressFormData;
  receiver: AddressFormData;
  business: AddressFormData;
  receiveUseBilling: boolean;
  businessUseBilling: boolean;
}

// 地址类型配置接口
export interface AddressTypeConfig {
  title: string;
  addressType: number;
  showCompanyFields: boolean;
  showVatEoriFields: boolean;
  requiredFields?: string[];
}

export type AddressType = 'billing' | 'receiver' | 'business';
