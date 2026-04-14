import {DefaultSession} from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: User & DefaultSession['user'];
  }

  interface User {
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

/**
 "accessToken": "happy",
 "refreshToken": "nice",
 "expiresTime": "",
 "openid": "qq768"
 */

declare module 'next-auth/jwt' {
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
