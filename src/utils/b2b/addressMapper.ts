/**
 * 地址数据转换器
 * 在不同类型之间进行地址数据的安全转换
 */

import type {AddressLine} from '@/types/api/address/type';
import type {AppTradeOrderAddressReqVO} from '@utils/api/b2b';

/**
 * 将 AddressLine 转换为订单提交所需的地址格式
 *
 * @param address - AddressLine 地址对象
 * @returns AppTradeOrderAddressReqVO 格式的地址
 */
export const toOrderAddressRequest = (
    address: AddressLine | null
): AppTradeOrderAddressReqVO => {
  if (!address) {
    return {
      name: '',
      mobile: '',
      detailAddress: '',
    };
  }

  return {
    name: `${address.firstName || ''} ${address.lastName || ''}`.trim(),
    mobile: address.phone || '',
    detailAddress: [
      address.address,
      address.street,
      address.city,
      address.state,
      address.country,
      address.postcode,
    ]
        .filter(Boolean)
        .join(', '),
  };
};

/**
 * 从地址对象提取显示用的完整地址
 *
 * @param address - AddressLine 地址对象
 * @returns 格式化的地址字符串
 */
export const formatFullAddress = (address: AddressLine | null): string => {
  if (!address) return '';

  const parts = [
    `${address.firstName || ''} ${address.lastName || ''}`.trim(),
    address.address,
    address.street,
    address.city,
    address.state,
    address.country,
    address.postcode,
    address.phone,
  ].filter(Boolean);

  return parts.join(', ');
};

/**
 * 从地址对象提取多行显示用的地址信息
 *
 * @param address - AddressLine 地址对象
 * @returns 地址行数组
 */
export const formatAddressLines = (address: AddressLine | null): string[] => {
  if (!address) return [];

  const lines: string[] = [];

  // 姓名
  const name = `${address.firstName || ''} ${address.lastName || ''}`.trim();
  if (name) lines.push(name);

  // 公司
  if (address.companyName) lines.push(address.companyName);

  // 地址行 1
  if (address.address) lines.push(address.address);

  // 地址行 2
  if (address.street) lines.push(address.street);

  // 城市 州 邮编
  const cityLine = [address.city, address.state, address.postcode]
      .filter(Boolean)
      .join(', ');
  if (cityLine) lines.push(cityLine);

  // 国家
  if (address.country) lines.push(address.country);

  // 电话
  if (address.phone) lines.push(address.phone);

  return lines;
};

/**
 * 比较两个地址是否相同
 *
 * @param addr1 - 地址 1
 * @param addr2 - 地址 2
 * @returns 是否相同
 */
export const areAddressesEqual = (
    addr1: AddressLine | null,
    addr2: AddressLine | null
): boolean => {
  if (!addr1 || !addr2) return addr1 === addr2;
  return addr1.id === addr2.id;
};

/**
 * 从地址列表查找默认地址
 *
 * @param addresses - 地址列表
 * @returns 默认地址，如果没有则返回第一个
 */
export const findDefaultAddress = (
    addresses: AddressLine[]
): AddressLine | null => {
  if (addresses.length === 0) return null;

  const defaultAddr = addresses.find((addr) => addr.defaultStatus);
  return defaultAddr || addresses[0];
};

/**
 * 将地址对象转换为表单初始值
 *
 * @param address - AddressLine 地址对象
 * @returns 表单初始值对象
 */
export const toFormInitialValues = (
    address: AddressLine | null
): Partial<AddressLine> => {
  if (!address) {
    return {
      firstName: '',
      lastName: '',
      companyName: '',
      address: '',
      street: '',
      country: '',
      state: '',
      city: '',
      postcode: '',
      phone: '',
      email: '',
      vat: '',
      eori: '',
    };
  }

  return {
    firstName: address.firstName || '',
    lastName: address.lastName || '',
    companyName: address.companyName || '',
    address: address.address || '',
    street: address.street || '',
    country: address.country || '',
    state: address.state || '',
    city: address.city || '',
    postcode: address.postcode || '',
    phone: address.phone || '',
    email: address.email || '',
    vat: address.vat || '',
    eori: address.eori || '',
  };
};

/**
 * 验证地址的必填字段
 *
 * @param address - 地址对象
 * @returns 验证结果
 */
export const validateAddressRequired = (
    address: AddressLine | null
): { valid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];

  if (!address) {
    return {valid: false, missingFields: ['address']};
  }

  const requiredFields: Array<keyof AddressLine> = [
    'firstName',
    'lastName',
    'address',
    'country',
    'city',
    'postcode',
    'phone',
  ];

  requiredFields.forEach((field) => {
    if (!address[field]) {
      missingFields.push(field);
    }
  });

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
};
