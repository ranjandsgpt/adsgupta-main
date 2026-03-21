import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const p = req.nextUrl.pathname;
      if (p === "/admin/login") return true;
      if (p.startsWith("/admin")) return !!token;
      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};
