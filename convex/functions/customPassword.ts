import { Password } from "@convex-dev/auth/providers/Password"
import { DataModel } from "../_generated/dataModel"
import { ResendOTP } from "../otp/resendOtp"

export const CustomPassword = () =>
  Password<DataModel>({
    verify: ResendOTP,
    validatePasswordRequirements: (password: string) => {
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long")
      }
    },
    profile(params) {
      return {
        name: params.name as string,
        email: params.email as string,
        emailVerificationTime: null,
        createdAt: new Date().toISOString(),
        password: params.password as string,
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
