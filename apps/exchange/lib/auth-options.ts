import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (
          email === process.env.EXCHANGE_ADMIN_EMAIL &&
          password === process.env.EXCHANGE_ADMIN_PASSWORD
        ) {
          return { id: "admin", email };
        }
        return null;
      }
    })
  ]
};
