// middleware.ts (in root of my-saas folder)
export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/invoice/:path*",
    "/clients/:path*",
    "/api/invoice/:path*",
    "/api/clients/:path*",
    "/api/analytics/:path*",
  ],
};