export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/",
    "/inventory",
    "/delivery",
    "/demand",
    "/yield",
    "/reporting",
    "/ai",
    "/protections",
    "/tags",
    "/settings"
  ]
};
