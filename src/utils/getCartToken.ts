import {GUEST_CART_TOKEN, IS_GUEST} from "@/utils/constants";
import {decodeJWT} from "@/utils/jwt-cookie";

export const getNativeCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split("; ").map((c) => c.trim());
  const found = cookies.find((c) => c.startsWith(name + "="));
  return found ? decodeURIComponent(found.split("=")[1]) : null;
};

interface TokenData {
  sessionToken: string;
  refreshToken: string;
  cartId: number;
  isGuest: boolean;
  expiresTime?: string;
}

/**
 * 检查 Token 是否过期
 */
const checkTokenExpiration = (expiresTime?: string): boolean => {
  if (!expiresTime) return false;

  const now = new Date();
  const expiry = new Date(expiresTime);
  // 提前 5 分钟检查过期
  const bufferTime = 5 * 60 * 1000;
  return now.getTime() + bufferTime >= expiry.getTime();
};

export const getCartToken = (): string | null => {
  const raw = getNativeCookie(GUEST_CART_TOKEN);
  if (!raw) return null;
  const isGuest = getNativeCookie(IS_GUEST) !== "false";

  const decoded = decodeJWT<TokenData>(raw, isGuest);

  // 检查 Token 是否过期
  if (decoded && checkTokenExpiration(decoded.expiresTime)) {
    return null; // Token 已过期，返回 null 触发重新获取
  }

  return decoded?.sessionToken ?? null;
};

//  fetch any cookie data
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

export const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
};

export const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; path=/`;
};