import {get, post} from "@utils/request/request";

// ======================= 重置密码 API =======================

/**
 * 发送重置密码邮件请求
 */
export async function sendResetPasswordMail(params: { email: string }): Promise<boolean> {
  return await post<boolean>(
      "member/auth/send-reset-password-mail",
      {params},
      {contentType: "urlencoded"}
  );
}

/**
 * 校验重置密码的 Token
 */
export async function validateResetToken(token: string): Promise<boolean> {
  return await get<boolean>("member/auth/validate-reset-token", {token});
}

/**
 * 重置密码请求体类型
 */
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

/**
 * 重置密码
 */
export async function resetPassword(
    request: ResetPasswordRequest
): Promise<boolean> {
  return await post<boolean>("member/auth/reset-password", request, {
    contentType: true,
  });
}

/**
 * 退出登录
 */
export async function logout(): Promise<boolean> {
  return await post<boolean>("member/auth/logout");
}

// ======================= 注册 API =======================

/**
 * 用户注册请求体类型
 */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * 用户注册
 */
export async function registerUser(request: RegisterRequest): Promise<boolean> {
  return await post<boolean>("member/auth/register", request, {
    contentType: true,
    requiresAuth: false
  });
}

export interface UserInfo {
  "id": number;
  "nickname": string;
  "avatar": string;
  "phone": number;
  "email": string;
  "sex": number;
  "point": number;
  "experience": number;
}
/**
 * 校验重置密码的 Token
 */
export async function getUserInfo(): Promise<UserInfo> {
  return await get<UserInfo>("member/user/get", {}, {
    contentType: true,
    requiresAuth: true,
  });
}