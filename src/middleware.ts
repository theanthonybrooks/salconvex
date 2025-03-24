import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server"

// const isPublicPage = createRouteMatcher(["/", "/archive", "/pricing"])
//note-to-self: Moved dashboard logic to the dashboard layout where it checks user and subscription status
// const isSubOnlyPage = createRouteMatcher(["/dashboard/:path*"])
const isAuthPage = createRouteMatcher(["/auth/:path*"])

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const isAuthenticated = await isAuthenticatedNextjs()
    console.log("isAuthenticatedNextjs:", isAuthenticated)

    if (isAuthPage(request) && (await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/")
    }

    // if (isAuthPage(request) && isAuthenticated) {
    //   return nextjsMiddlewareRedirect(request, "/")
    // }
  },
  { cookieConfig: { maxAge: 60 * 60 * 24 * 30 } }
)

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
