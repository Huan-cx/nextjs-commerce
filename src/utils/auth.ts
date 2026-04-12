import NextAuth, {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {fetchHandler} from "./fetch-handler";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
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

        const response = await fetchHandler({
          url: "member/auth/login",
          method: "POST",
          body: {
            loginAccount: credentials.username,
            password: credentials.password,
          },
        });
        if (response.code !== 0 || !response.data) {
          throw new Error(response.msg || "Invalid credentials.");
        }

        const {userId, accessToken} = response.data;

        return {
          id: userId.toString(),
          email: credentials.username, // Keep email for display/compatibility
          name: credentials.username,   // Keep name for display/compatibility
          apiToken: accessToken, // For compatibility with existing code that might use apiToken
          accessToken: accessToken,
          role: "customer",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.apiToken = user.apiToken;
        token.accessToken = user.accessToken;
        token.role = "customer";
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id || "",
        apiToken: token.apiToken,
        accessToken: token.accessToken,
        role: token.role,
      };

      return session;
    },
  },

  pages: {
    signIn: "/customer/login",
    error: "/login",
  },

  secret: process.env.NEXT_PUBLIC_NEXT_AUTH_SECRET,
};

export const handler = NextAuth(authOptions);
