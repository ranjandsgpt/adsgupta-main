import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

function adminUsers() {
  return [
    {
      email: process.env.ADMIN_USER_1_EMAIL?.trim().toLowerCase(),
      passwordHash: process.env.ADMIN_USER_1_PASSWORD,
      name: process.env.ADMIN_USER_1_NAME || "Admin 1",
      subdomain: process.env.ADMIN_USER_1_SUBDOMAIN || "ranjan",
    },
    {
      email: process.env.ADMIN_USER_2_EMAIL?.trim().toLowerCase(),
      passwordHash: process.env.ADMIN_USER_2_PASSWORD,
      name: process.env.ADMIN_USER_2_NAME || "Admin 2",
      subdomain: process.env.ADMIN_USER_2_SUBDOMAIN || "pousali",
    },
  ].filter((u) => u.email && u.passwordHash);
}

/** @type {import("next-auth").NextAuthOptions} */
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password || "";
        if (!email || !password) return null;

        const users = adminUsers();
        const user = users.find((u) => u.email === email);
        if (!user) return null;

        const ok = bcrypt.compareSync(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: email,
          email: user.email,
          name: user.name,
          subdomain: user.subdomain,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.subdomain = user.subdomain;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.subdomain = token.subdomain;
        session.user.id = token.sub || session.user.email;
        if (token.name) session.user.name = token.name;
      }
      return session;
    },
  },
};
