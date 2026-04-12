import {post} from "@utils/request/request";
import {OAuth2Token} from "@/types/api/auth";

export async function createGuestAccessToken(): Promise<OAuth2Token> {
  return post<OAuth2Token>(`member/auth/guest-token`, {}, {
    contentType: 'urlencoded'
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<OAuth2Token> {
  return post<OAuth2Token>(`member/auth/refresh-token`, {
    refreshToken
  }, {
    contentType: 'urlencoded'
  });
}