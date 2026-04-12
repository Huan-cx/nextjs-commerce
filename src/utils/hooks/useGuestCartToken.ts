// src/utils/hooks/useGuestCartToken.ts
"use client";

import {useEffect, useRef, useState} from "react";
import {GUEST_CART_ID, GUEST_CART_TOKEN, IS_GUEST} from "@/utils/constants";
import {decodeJWT, encodeJWT} from "@/utils/jwt-cookie";
import {deleteCookie, getNativeCookie, setCookie} from "../getCartToken";
import {createGuestAccessToken, refreshAccessToken} from "@utils/api/auth";

interface TokenData {
  sessionToken: string;
  refreshToken: string;
  cartId: number;
  isGuest: boolean;
  expiresTime?: string;
}

// 全局变量，用于存储正在进行的 Token 请求和定时器
let globalTokenPromise: Promise<string | null> | null = null;
let globalRefreshTimer: NodeJS.Timeout | null = null;

// ---------------------------
// Main Hook
// ---------------------------
export const useGuestCartToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [cartId, setCartId] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  const isResettingRef = useRef(false);
  const tokenCreatedRef = useRef(false);

  // 计算刷新时间（过期前 5 分钟）
  const calculateRefreshTime = (expiresTime?: string): number => {
    if (!expiresTime) return 0;

    const now = new Date();
    const expiry = new Date(expiresTime);
    const timeUntilExpiry = expiry.getTime() - now.getTime();
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000); // 过期前 5 分钟

    return Math.max(0, refreshTime);
  };

  // 设置定时刷新任务
  const setupRefreshTimer = (expiresTime?: string) => {
    // 清除之前的定时器
    if (globalRefreshTimer) {
      clearTimeout(globalRefreshTimer);
    }

    const refreshTime = calculateRefreshTime(expiresTime);
    if (refreshTime > 0) {
      globalRefreshTimer = setTimeout(async () => {
        try {
          await createGuestToken();
        } catch (error) {
          console.error("Error refreshing token:", error);
        }
      }, refreshTime);
    }
  };

  const checkTokenExpiration = (expiresTime?: string): boolean => {
    if (!expiresTime) return false;

    const now = new Date();
    const expiry = new Date(expiresTime);
    // 提前 5 分钟检查过期
    const bufferTime = 5 * 60 * 1000;
    return now.getTime() + bufferTime >= expiry.getTime();
  };

  const createGuestToken = async (): Promise<string | null> => {
    // 如果已经有正在进行的 Token 请求，返回该 Promise
    if (globalTokenPromise) {
      return globalTokenPromise;
    }

    globalTokenPromise = (async () => {
      try {
        if (tokenCreatedRef.current) {
          // Return existing raw token from cookie
          const cookieVal = getNativeCookie(GUEST_CART_TOKEN);
          if (cookieVal) {
            const isGuest = getNativeCookie(IS_GUEST) !== "false";
            const decoded = decodeJWT<TokenData>(cookieVal, isGuest);

            // Check if token is expired
            if (decoded && !checkTokenExpiration(decoded.expiresTime)) {
              return decoded?.sessionToken ?? null;
            }

            // Token expired, try to refresh
            if (decoded && decoded.refreshToken) {
              try {
                const refreshedToken = await refreshAccessToken(decoded.refreshToken);
                if (refreshedToken) {
                  const newTokenData: TokenData = {
                    sessionToken: refreshedToken.accessToken,
                    refreshToken: refreshedToken.refreshToken,
                    cartId: refreshedToken.userId,
                    isGuest: true,
                    expiresTime: refreshedToken.expiresTime
                  };
                  const newToken = encodeJWT(newTokenData);
                  const newCartId = Number(refreshedToken.userId);

                  setCookie(GUEST_CART_TOKEN, newToken);
                  setCookie(GUEST_CART_ID, String(newCartId));
                  setCookie(IS_GUEST, String(true));

                  setToken(refreshedToken.accessToken);
                  setCartId(newCartId);
                  if (refreshedToken.expiresTime) {
                    setupRefreshTimer(refreshedToken.expiresTime);
                  }
                  return refreshedToken.accessToken;
                }
              } catch (error) {
                console.error("Error refreshing token:", error);
                // If refresh fails, fall through to create new token
              }
            }
          }
        }
        tokenCreatedRef.current = true;

        const guestToken = await createGuestAccessToken();
        if (!guestToken) {
          tokenCreatedRef.current = false;
          return null;
        }

        const tokenData: TokenData = {
          sessionToken: guestToken.accessToken,
          refreshToken: guestToken.refreshToken,
          cartId: guestToken.userId,
          isGuest: true,
          expiresTime: guestToken.expiresTime
        };
        const newToken = encodeJWT(tokenData);
        const newCartId = Number(guestToken.userId);

        setCookie(GUEST_CART_TOKEN, newToken);
        setCookie(GUEST_CART_ID, String(newCartId));
        setCookie(IS_GUEST, String(true));

        // State and return should be the RAW token
        setToken(guestToken.accessToken);
        setCartId(newCartId);

        if (tokenData.expiresTime) {
          setupRefreshTimer(tokenData.expiresTime);
        }
        return guestToken.accessToken;
      } catch (e) {
        console.error("Error creating guest token:", e);
        tokenCreatedRef.current = false;
        return null;
      } finally {
        // 清除正在进行的请求
        globalTokenPromise = null;
      }
    })();

    return globalTokenPromise;
  };

  const resetGuestToken = async () => {
    if (isResettingRef.current) return;
    isResettingRef.current = true;

    tokenCreatedRef.current = false;

    // delete old
    deleteCookie(GUEST_CART_TOKEN);
    deleteCookie(GUEST_CART_ID);

    await createGuestToken();

    isResettingRef.current = false;
  };

  useEffect(() => {
    const checkToken = async () => {
      try {
        const cookieToken = getNativeCookie(GUEST_CART_TOKEN);

        if (cookieToken) {
          const isGuest = getNativeCookie(IS_GUEST) !== "false";
          const decoded = decodeJWT<TokenData>(cookieToken, isGuest);

          if (decoded) {
            // Check if token is expired
            if (!checkTokenExpiration(decoded.expiresTime)) {
              setToken(decoded.sessionToken);
              setCartId(decoded.cartId);
              if (decoded.expiresTime) {
                setupRefreshTimer(decoded.expiresTime);
              }
            } else {
              // Token expired, create new one
              await createGuestToken();
            }
          }
        } else {
          // No token, create new one
          await createGuestToken();
        }
      } catch (error) {
        console.error("Error checking token:", error);
      } finally {
        setIsReady(true);
      }
    };

    checkToken();

    // 组件卸载时不清除定时器，因为定时器是全局的，其他组件可能还在使用
  }, []);

  return {
    token,
    cartId,
    isReady,
    createGuestToken,
    resetGuestToken,
    deleteCookie,
  };
};