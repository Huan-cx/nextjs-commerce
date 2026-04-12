// src/types/api/address/type.ts

/**
 * 地址类型
 */
export interface Address {
  id: number;
  firstName: string;
  lastName: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  email: string;
  phone: string;
  street: string;
  defaultStatus: boolean;
  type: number;
  vat: string;
  eori: string;
}


/**
 * 地 国家/地区列表响应
 */
export interface Geo {
  id: number;
  name: string;
  code: string;
}

/**
 * 地址添加请求
 */
export interface AddressAddRequest {
  firstName: string;
  lastName: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  email: string;
  phone: string;
  street: string;
  defaultStatus: boolean;
  type: number;
  vat: string;
  eori: string;
}

/**
 * 地址添加响应
 */
export interface AddressAddResponse {
  code: number;
  msg: string;
  data: Address;
}

/**
 * 地址更新请求
 */
export interface AddressUpdateRequest extends AddressAddRequest {
  id: number;
}

/**
 * 地址更新响应
 */
export interface AddressUpdateResponse {
  code: number;
  msg: string;
  data: Address;
}

/**
 * 地址删除响应
 */
export interface AddressDeleteResponse {
  code: number;
  msg: string;
  data: boolean;
}