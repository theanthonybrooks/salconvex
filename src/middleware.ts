import { NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";

import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
} from "@convex-dev/auth/nextjs/server";

// const isPublicPage = createRouteMatcher(["/", "/archive", "/pricing"])

const isAuthPage = createRouteMatcher(["/auth/:path*"]);
const isDashboardPage = createRouteMatcher(["/dashboard/:path*"]);
const isSubmitPage = createRouteMatcher(["/submit"]);
// const isOpenCallPage = createRouteMatcher([
//   "/thelist/event/:slug/:year/call",
//   "/thelist/event/:slug/:year/call/:path*",
// ]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    // const cookies = request.cookies.getAll();
    // console.log("cookies:", cookies);
    // const loginUrl = request.cookies.get("login_url")?.value;
    // if (loginUrl) {
    //   console.log("loginUrl:", loginUrl);
    // }
    const pathname = request.nextUrl.pathname;
    if (/\.(ico|png|jpg|jpeg|svg|gif|webp|txt|xml)$/.test(pathname)) {
      return NextResponse.next();
    }

    // redirect /extras/... → /resources/...
    if (pathname.includes("/extras/")) {
      const target = pathname.replace("/extras/", "/resources/");
      return NextResponse.redirect(new URL(target, request.url));
    }

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
        return NextResponse.redirect(new URL("/?initial=true", request.url));
      }

      // fallback for any other /auth/* page
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!isAuthenticated) {
      if (isDashboardPage(request)) {
        return NextResponse.redirect(new URL("/auth/sign-in", request.url));
      }
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
