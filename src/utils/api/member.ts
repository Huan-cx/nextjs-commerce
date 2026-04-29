import {get, post, put} from "@utils/request/request";

// ======================= 重置密码 API =======================

/**
 * 发送重置密码邮件请求
 */
export async function sendResetPasswordMail(params: { email: string }): Promise<boolean> {
  return await post<boolean>(
      "member/auth/send-reset-password-mail",
      params,
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

// ======================= 发送验证码 API =======================

/**
 * 发送验证码请求体类型
 */
export interface SendCodeRequest {
  email: string;
}

/**
 * 发送验证码
 */
export async function sendVerificationCode(request: SendCodeRequest): Promise<boolean> {
  return await post<boolean>("member/auth/send-verify-code", request, {
    contentType: true,
  });
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
 * 获取用户信息
 */
export async function getUserInfo(): Promise<UserInfo> {
  return await get<UserInfo>("member/user/get", {}, {
    contentType: true,
    requiresAuth: true,
  });
}

// ======================= 用户信息更新 API =======================

/**
 * 用户信息更新请求体类型
 */
export interface UpdateUserInfoRequest {
  nickname: string;
  avatar?: string;
  sex: number;
  email?: string;
}

/**
 * 更新用户信息
 */
export async function updateUserInfo(request: UpdateUserInfoRequest): Promise<boolean> {
  return await put<boolean>("member/user/update", request, {
    contentType: true,
    requiresAuth: true,
  });
}

// ======================= 修改密码 API =======================

/**
 * 修改密码请求体类型
 */
export interface UpdatePasswordRequest {
  password: string;
  code: string;
}

/**
 * 修改密码
 */
export async function updatePassword(request: UpdatePasswordRequest): Promise<boolean> {
  return await put<boolean>("member/user/update-password", request, {
    contentType: true,
    requiresAuth: true,
  });
}