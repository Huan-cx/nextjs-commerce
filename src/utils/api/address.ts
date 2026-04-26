import {del, get, post, put} from "@utils/request/request";
import {AddressAddRequest, AddressLine, AddressUpdateRequest, Geo,} from "@/types/api/address/type";

/**
 * 获取地址列表
 */
export async function getAddressList(): Promise<AddressLine[]> {
  const response = await get<AddressLine[]>("member/address/list", undefined, {
    contentType: 'urlencoded',
    requiresAuth: true
  });
  return response;
}

/**
 * 添加地址
 * @param params 地址信息
 */
export async function addAddress(params: AddressAddRequest): Promise<AddressLine> {
  const response = await post<AddressLine>("member/address/create", params, {
    contentType: true,
    requiresAuth: true
  });
  return response;
}

/**
 * 更新地址
 * @param params 地址信息
 */
export async function updateAddress(params: AddressUpdateRequest): Promise<AddressLine> {
  const response = await put<AddressLine>("member/address/update", params, {
    contentType: true,
    requiresAuth: true
  });
  return response;
}

/**
 * 删除地址
 * @param id 地址 ID
 */
export async function deleteAddress(id: number): Promise<boolean> {
  const response = await del<boolean>("member/address/delete", {id}, {
    contentType: 'urlencoded',
    requiresAuth: true
  });
  return response;
}

/**
 * 获取地址列表
 */
export async function getGeoList(): Promise<Geo[]> {
  return await get<Geo[]>("system/area/tree", {}, {
    contentType: 'urlencoded',
    requiresAuth: false
  });
}