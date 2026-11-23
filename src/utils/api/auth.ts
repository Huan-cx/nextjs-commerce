import {post} from "@utils/request/request";
import {JWT} from "next-auth/jwt";

export interface LoginCredentials {
  loginAccount: string;
  password: string;
}

/**
 * 用户登录
 * @param credentials 登录账号和密码
 * @returns JWT token信息
 */
export async function login(credentials: LoginCredentials): Promise<JWT> {
  return post<JWT>(`member/auth/login`, credentials, {
    contentType: true
  });
}

/**
 * 刷新访问令牌
 * 注意：后端接口通过 @RequestParam 接收 refreshToken 参数，因此需要通过 query 传递而非 body
 * @param refreshToken 刷新令牌
 * @returns 新的JWT token信息
 */
export async function refreshAccessToken(refreshToken: string): Promise<JWT> {
  return post<JWT>(`member/auth/refresh-token`, null, {
    params: {refreshToken},
    contentType: 'urlencoded'
  });
}