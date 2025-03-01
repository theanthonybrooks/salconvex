import Github from "@auth/core/providers/github"
import Google from "@auth/core/providers/google"
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server"
import { ConvexError } from "convex/values"
import { Scrypt } from "lucia"
import { CustomPassword } from "./functions/customPassword"
import { ResendOTP } from "./otp/resendOtp"
import { findUserByEmail } from "./users"

const scrypt = new Scrypt()
const scryptCrypto = {
  hashSecret: async (secret: string): Promise<string> => {
    return scrypt.hash(secret)
  },
  verifySecret: async (secret: string, hash: string): Promise<boolean> => {
    return scrypt.verify(secret, hash)
  },
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Github, Google, CustomPassword, ResendOTP],
  callbacks: {
    async createOrUpdateUser(ctx, { existingUserId, profile, type, provider }) {
      console.log("profile data:", profile)
      console.log("provider:", provider)
      console.log("type:", type)
      console.log("existingUserId:", existingUserId)
      if (existingUserId) {
        const user = await ctx.db.get(existingUserId)
        if (type === "oauth" && profile.image !== undefined && !user.image) {
          console.log("profile.image:", profile.image)
          await ctx.db.patch(existingUserId, { image: profile.image })
        }

        return existingUserId
      }

      if (!profile.email) {
        throw new ConvexError("Email is required but not provided.")
      }

      const existingUser = await findUserByEmail(ctx, profile.email)
      if (existingUser) {
        if (type === "credentials") {
          if (typeof profile.password !== "string") {
            throw new ConvexError("Password must be a string.")
          }
          if (!existingUser.password) {
            throw new ConvexError("No password stored for this user.")
          }
          const isValid = await scryptCrypto.verifySecret(
            profile.password,
            existingUser.password
          )

          if (!isValid) {
            throw new ConvexError("Invalid password.")
          }
        }

        return existingUser._id
      }

      if (type === "oauth") {
        throw new ConvexError(
          "No account found. Sign up with email and password first."
        )
      }

      if (typeof profile.password !== "string") {
        throw new Error("Password must be a string.")
      }
      const currentId = await getAuthUserId(ctx)

      const hashedPassword = await scryptCrypto.hashSecret(profile.password)

      const newUserId = await ctx.db.insert("users", {
        name: profile.name
          ? profile.name
          : profile.firstName + " " + profile.lastName,
        email: profile.email,
        emailVerificationTime: null,
        createdAt: new Date().toISOString(),
        password: hashedPassword,
        firstName: profile.firstName,
        lastName: profile.lastName,
        accountType: profile.accountType,
        organizationName: profile.organizationName,
        source: profile.source,
        userId: currentId ? currentId : `temp${new Date().toISOString}`,
        role: profile.role ?? ["user"],
        tokenIdentifier: currentId
          ? currentId
          : `temp${new Date().toISOString}`,
      })

      return newUserId
    },
  },
})
