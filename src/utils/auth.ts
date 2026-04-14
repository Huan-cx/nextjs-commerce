import NextAuth, {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {login, refreshAccessToken} from "@utils/api/auth";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    // 移除 maxAge，完全依赖 API 返回的 expiresTime 控制 session 过期
    // 这样可以确保 session 过期与 API token 过期完全同步
    maxAge: 60,
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      authorize: async (credentials): Promise<any> => {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const response = await login({
          loginAccount: credentials.username,
          password: credentials.password,
        });
        return {
          ...response,
          id: response.userId?.toString(),
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiresTime: user.expiresTime, // 后端返回的绝对过期时间戳
        };
      }

      // 如果当前时间小于过期时间，说明 accessToken 仍然有效，直接返回
      if (Date.now() < (token.expiresTime as number)) {
        return token;
      }
      console.log("accessToken 过期，尝试刷新");
      // 如果 accessToken 已过期，尝试刷新它
      return await refreshAccessToken(token.refreshToken);
    },

    async session({ session, token }) {
      // 将 Token 数据传递给客户端 Session
      return {
        ...session,
        user: {
          ...token,
          name: token.nickname,
        },
      };
    },
  },

  pages: {
    signIn: "/customer/login",
    error: "/login",
  },

  secret: process.env.NEXT_PUBLIC_NEXT_AUTH_SECRET,
};

export const handler = NextAuth(authOptions);