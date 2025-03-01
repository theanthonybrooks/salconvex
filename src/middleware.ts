import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server"

const isPublicPage = createRouteMatcher(["/auth/:path*"])
const isSignInpage = createRouteMatcher(["/auth/sign-in"])

export default convexAuthNextjsMiddleware(async (request) => {
  const isAuthenticated = await isAuthenticatedNextjs()

  // console.log("isAuthenticatedNextjs:", isAuthenticated)
  // console.log("isPublicPage:", isPublicPage(request))
  // console.log("request", request)

  if (!isPublicPage(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/auth/sign-in")
  }
  if (isPublicPage(request) && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/")
  }
})

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
