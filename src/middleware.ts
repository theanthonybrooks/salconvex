import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";

// const isPublicPage = createRouteMatcher(["/", "/archive", "/pricing"])

const isAuthPage = createRouteMatcher(["/auth/:path*"]);
// const isOpenCallPage = createRouteMatcher([
//   "/thelist/event/:slug/:year/call",
//   "/thelist/event/:slug/:year/call/:path*",
// ]);

const isSubmitPage = createRouteMatcher(["/submit"]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const userAgent = request.headers.get("user-agent") || "";
    const ua = new UAParser(userAgent).getResult();

    // const isAuthenticated = await isAuthenticatedNextjs()
    const isAuthenticated = await convexAuth.isAuthenticated();
    // console.log("isAuthenticatedNextjs:", isAuthenticated);
    // console.log("isAuthenticatedNextjs:", isAuthenticated)

    if (isAuthPage(request) && isAuthenticated) {
      const path = request.nextUrl.pathname;

      if (path.startsWith("/auth/register")) {
        return NextResponse.redirect(new URL("/pricing", request.url));
      }

      if (path.startsWith("/auth/sign-in")) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // fallback for any other /auth/* page
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isSubmitPage(request)) {
      return NextResponse.redirect(new URL("/pricing?submit", request.url));
    }

    // if (isOpenCallPage(request) && !isAuthenticated) {
    //   return nextjsMiddlewareRedirect(request, "/auth/sign-in");
    // }

    // if (isAuthPage(request) && isAuthenticated) {
    //   return nextjsMiddlewareRedirect(request, "/")
    // }

    const response = NextResponse.next();
    response.headers.set("x-pathname", request.nextUrl.pathname);
    response.headers.set("x-device-type", ua.device.type || "desktop");
    response.headers.set("x-device-vendor", ua.device.vendor || "");
    response.headers.set("x-device-model", ua.device.model || "");
    response.headers.set("x-os-name", ua.os.name || "");
    response.headers.set("x-os-version", ua.os.version || "");
    response.headers.set("x-browser-name", ua.browser.name || "");
    response.headers.set("x-browser-version", ua.browser.version || "");
    return response;
  },
  { cookieConfig: { maxAge: 60 * 60 * 24 * 30 } },
);

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
