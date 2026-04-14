import {post} from "@utils/request/request";
import {JWT} from "next-auth/jwt";


export async function login(password: { loginAccount: any; password: any }): Promise<JWT> {
  return post<JWT>(`member/auth/login`,
      password
      , {
        contentType: true
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<JWT> {
  return post<JWT>(`member/auth/refresh-token`, {
    refreshToken
  }, {
    contentType: 'urlencoded'
  });
}