import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Role-based route protection
    if (path.startsWith("/dashboard/athlete") && token?.role !== "ATHLETE") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path.startsWith("/dashboard/coach") && token?.role !== "COACH") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path.startsWith("/dashboard/organizer") && token?.role !== "ORGANIZER") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Allow public routes
        if (
          path === "/" ||
          path.startsWith("/auth") ||
          path.startsWith("/api/auth") ||
          path.startsWith("/_next") ||
          path.startsWith("/favicon")
        ) {
          return true;
        }

        // Require auth for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/hub/:path*",
    "/dashboard/:path*",
    "/compete/:path*",
    "/learn/:path*",
    "/connect/:path*",
    "/apply/:path*",
    "/recover/:path*",
    "/track/:path*",
    "/competitions/:path*",
    "/profile/:path*",
    "/connections/:path*",
    "/applications/:path*",
    "/search/:path*",
  ],
};
