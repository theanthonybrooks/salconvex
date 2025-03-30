import Github from "@auth/core/providers/github"
import Google from "@auth/core/providers/google"
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server"
import { ConvexError } from "convex/values"
import { Scrypt } from "lucia"
import { CustomPassword } from "./functions/customPassword"
import { ResendOTP } from "./otp/resendOtp"
import { findUserByEmail } from "./users"

export const scryptCrypto = {
  async hashSecret(password: string) {
    return await new Scrypt().hash(password)
  },
  async verifySecret(password: string, hash: string) {
    return await new Scrypt().verify(hash, password)
  },
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Github,
    Google({
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
        },
      },
    }),
    CustomPassword,
    ResendOTP,
  ],
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
      console.log("existingUser: ", existingUser)
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
        createdAt: Date.now(),
        password: hashedPassword,
        firstName: profile.firstName,
        lastName: profile.lastName,
        accountType: profile.accountType,
        source: profile.source,
        userId: currentId ? currentId : `temp${Date.now()}`,
        role: profile.role ?? ["user"],
        tokenIdentifier: currentId ? currentId : `temp${Date.now()}`,
        emailVerified: false,
      })

      console.log("newUserId: ", newUserId)

      const userAccountType = profile.accountType as string[]

      console.log("userAccountType: ", userAccountType)

      if (userAccountType.includes("organizer")) {
        await ctx.db.insert("organizations", {
          ownerId: newUserId,
          organizationName: profile.organizationName,
          logo: "/1.jpg",
          hadFreeCall: false,
        })
      }

      await ctx.db.insert("userPreferences", {
        userId: newUserId,
        timezone: "GMT",
        language: "EN",
        currency: "USD",
        theme: "default",
      })

      return newUserId
    },
  },
})
