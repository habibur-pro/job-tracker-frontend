// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If user is already logged in and tries to go to /login, redirect to /dashboard
    if (pathname.startsWith("/login") && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only protect /dashboard routes
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (pathname.startsWith("/dashboard")) {
          return !!token; // only allow logged-in users
        }
        return true; // allow other routes
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/login"], // apply middleware to dashboard & login
};
