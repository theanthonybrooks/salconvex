import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server"

const isPublicPage = createRouteMatcher(["/", "/archive", "/pricing"])
const isSubOnlyPage = createRouteMatcher(["/dashboard/:path*"])
const isAuthPage = createRouteMatcher(["/auth/:path*"])

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const isAuthenticated = await isAuthenticatedNextjs()
    console.log("isAuthenticatedNextjs:", isAuthenticated)

    // console.log("isAuthenticatedNextjs:", isAuthenticated)
    // console.log("isPublicPage:", isPublicPage(request))
    // console.log("request", request)
    if (isAuthPage(request) && (await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/")
    }

    if (isSubOnlyPage(request) && !isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/auth/sign-in")
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
