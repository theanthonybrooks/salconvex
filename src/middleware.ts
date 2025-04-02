import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// const isPublicPage = createRouteMatcher(["/", "/archive", "/pricing"])
//note-to-self: Moved dashboard logic to the dashboard layout where it checks user and subscription status
// const isSubOnlyPage = createRouteMatcher(["/dashboard/:path*"])
const isAuthPage = createRouteMatcher(["/auth/:path*"]);
const isOpenCallPage = createRouteMatcher([
  "/thelist/event/:slug/call",
  "/thelist/event/:slug/call/:path*",
]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    // const isAuthenticated = await isAuthenticatedNextjs()
    // console.log("isAuthenticatedNextjs:", isAuthenticated)

    if (isAuthPage(request) && (await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/");
    }

    if (isOpenCallPage(request) && !(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/auth/sign-in");
    }

    // if (isAuthPage(request) && isAuthenticated) {
    //   return nextjsMiddlewareRedirect(request, "/")
    // }
  },
  { cookieConfig: { maxAge: 60 * 60 * 24 * 30 } },
);

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
