import {DefaultSession, DefaultUser} from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    userId: number;
    nickname: string;
    avatar: string;
    email: string;
    sex: number;
    point: number;
    experience: number;
    brokerageEnabled: boolean;
    accessToken: string;
    refreshToken: string;
    expiresTime: number;
    openid?: string;
  }

  interface Session {
    user: {
      userId: number;
      nickname: string;
      avatar: string;
      email: string;
      point: number;
      experience: number;
      brokerageEnabled: boolean;
      accessToken: string;
      refreshToken: string;
      expiresTime: number;
      openid?: string;
    } & DefaultSession['user'];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: number;
    nickname: string;
    avatar: string;
    email: string;
    point: number;
    experience: number;
    brokerageEnabled: boolean;
    accessToken: string;
    refreshToken: string;
    expiresTime: number;
    openid?: string;
  }
}
