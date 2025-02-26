import Github from "@auth/core/providers/github"
import Google from "@auth/core/providers/google"
import { Password } from "@convex-dev/auth/providers/Password"
import { convexAuth } from "@convex-dev/auth/server"
import bcrypt from "bcryptjs"
import { ConvexError } from "convex/values"
import { DataModel } from "./_generated/dataModel"

import { ResendOTP } from "@/features/auth/providers/resend-otp"
import { findUserByEmail } from "./users"

const hashPassword = (password: string): string => {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(password, salt)
}

const CustomPassword = Password<DataModel>({
  profile(params) {
    const hashedPassword = hashPassword(params.password as string)
    return {
      name: params.name as string,
      email: params.email as string,
      emailVerificationTime: Date.now(),

      createdAt: Date.now(),
      password: hashedPassword,
      firstName: params.firstName as string,
      lastName: params.lastName as string,
      accountType: params.accountType as string[],
      organizationName: params.organizationName as string,
      source: params.source as string,
      userId: params.userId as string,
      role: ["user"],
      subscription: params.subscription as string,
      tokenIdentifier: params.userId as string,
    }
  },
})

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Github, Google, CustomPassword, ResendOTP],
  callbacks: {
    async createOrUpdateUser(ctx, { existingUserId, profile, type }) {
      if (existingUserId) {
        console.log("existingUserId", existingUserId)
        return existingUserId
      }

      if (!profile.email) {
        throw new ConvexError("Email is required but not provided.")
      }

      const existingUser = await findUserByEmail(ctx, profile.email)
      if (existingUser) {
        // **Sign-In Flow: Validate Password**
        if (type === "credentials") {
          const isValidPassword = bcrypt.compareSync(
            profile.password as string,
            existingUser.password
          )
          if (!isValidPassword) {
            throw new ConvexError("Invalid password.")
          }
        }

        return existingUser._id // Successfully signed in
      }

      // if (!existingUser) throw new ConvexError("No account found.")

      if (type === "oauth") {
        throw new ConvexError(
          "No account found. Sign up with email and password first."
        )
      }

      const newUserId = await ctx.db.insert("users", {
        name: profile.name
          ? profile.name
          : profile.firstName + " " + profile.lastName,
        email: profile.email,
        emailVerificationTime: Date.now(),
        createdAt: Date.now(),
        password: profile.password,
        firstName: profile.firstName,
        lastName: profile.lastName,
        accountType: profile.accountType,
        organizationName: profile.organizationName,
        source: profile.source,
        userId: profile.userId,
        role: profile.role ?? ["user"],
        tokenIdentifier: profile.userId,
      })

      return newUserId
    },
  },
})
