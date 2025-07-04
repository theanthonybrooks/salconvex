import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

// const isPublicPage = createRouteMatcher(["/", "/archive", "/pricing"])

const isAuthPage = createRouteMatcher(["/auth/:path*"]);
const isOpenCallPage = createRouteMatcher([
  "/thelist/event/:slug/:year/call",
  "/thelist/event/:slug/:year/call/:path*",
]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    // const isAuthenticated = await isAuthenticatedNextjs()
    const isAuthenticated = await convexAuth.isAuthenticated();
    // console.log("isAuthenticatedNextjs:", isAuthenticated);
    // console.log("isAuthenticatedNextjs:", isAuthenticated)

    if (isAuthPage(request) && isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/");
    }

    if (isOpenCallPage(request) && !isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/auth/sign-in");
    }

    // if (isAuthPage(request) && isAuthenticated) {
    //   return nextjsMiddlewareRedirect(request, "/")
    // }

    const response = NextResponse.next();
    response.headers.set("x-pathname", request.nextUrl.pathname);
    return response;
  },
  { cookieConfig: { maxAge: 60 * 60 * 24 * 30 } },
);

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
