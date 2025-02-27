// import Github from "@auth/core/providers/github"
// import Google from "@auth/core/providers/google"
// import { Password } from "@convex-dev/auth/providers/Password"
// import { convexAuth } from "@convex-dev/auth/server"
// import { CustomPassword } from "./functions/customPassword"
// import { ResendOTP } from "./otp/resendOtp"

// const pw = CustomPassword

// export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
//   providers: [Github, Google, Password({ verify: ResendOTP }), ResendOTP],
//   // callbacks: {
//   //   async createOrUpdateUser(ctx, { existingUserId, profile, type }) {
//   //     if (existingUserId) {
//   //       return existingUserId
//   //     }

//   //     if (!profile.email) {
//   //       throw new ConvexError("Email is required but not provided.")
//   //     }

//   //     const existingUser = await findUserByEmail(ctx, profile.email)
//   //     if (existingUser) {
//   //       if (type === "credentials") {
//   //         const isValidPassword = bcrypt.compareSync(
//   //           profile.password as string,
//   //           existingUser.password
//   //         )
//   //         if (!isValidPassword) {
//   //           throw new ConvexError("Invalid password.")
//   //         }
//   //       }

//   //       return existingUser._id // Successfully signed in
//   //     }

//   //     // if (!existingUser) throw new ConvexError("No account found.")

//   //     if (type === "oauth") {
//   //       throw new ConvexError(
//   //         "No account found. Sign up with email and password first."
//   //       )
//   //     }
//   //     const userId = uuidv4() // Generate your custom userId
//   //     const newUserId = await ctx.db.insert("users", {
//   //       name: profile.name
//   //         ? profile.name
//   //         : profile.firstName + " " + profile.lastName,
//   //       email: profile.email,
//   //       emailVerificationTime: Date.now(),
//   //       createdAt: new Date().toISOString(),
//   //       password: profile.password,
//   //       firstName: profile.firstName,
//   //       lastName: profile.lastName,
//   //       accountType: profile.accountType,
//   //       organizationName: profile.organizationName,
//   //       source: profile.source,
//   //       userId,
//   //       role: profile.role ?? ["user"],
//   //       tokenIdentifier: userId,
//   //     })

//   //     return newUserId
//   //   },
//   // },
// })

import Github from "@auth/core/providers/github"
import Google from "@auth/core/providers/google"
import { convexAuth } from "@convex-dev/auth/server"
import { ConvexError } from "convex/values"
import { Scrypt } from "lucia"
import { v4 as uuidv4 } from "uuid"
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
    async createOrUpdateUser(ctx, { existingUserId, profile, type }) {
      if (existingUserId) {
        return existingUserId
      }

      if (!profile.email) {
        throw new ConvexError("Email is required but not provided.")
      }

      const existingUser = await findUserByEmail(ctx, profile.email)
      if (existingUser) {
        // If the user exists, verify the password for credentials login
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
      const hashedPassword = await scryptCrypto.hashSecret(profile.password)
      const userId = uuidv4()
      const newUserId = await ctx.db.insert("users", {
        name: profile.name
          ? profile.name
          : profile.firstName + " " + profile.lastName,
        email: profile.email,
        emailVerificationTime: Date.now(),
        createdAt: new Date().toISOString(),
        password: hashedPassword,
        firstName: profile.firstName,
        lastName: profile.lastName,
        accountType: profile.accountType,
        organizationName: profile.organizationName,
        source: profile.source,
        userId,
        role: profile.role ?? ["user"],
        tokenIdentifier: userId,
      })

      return newUserId
    },
  },
})
