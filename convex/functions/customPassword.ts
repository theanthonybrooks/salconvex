import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";
import { Scrypt } from "lucia";
import { DataModel } from "../_generated/dataModel";
import { ResendOTP } from "../otp/resendOtp";
import { ResetOTP } from "../otp/resetOtp";

export const CustomPassword = () =>
  Password<DataModel>({
    verify: ResendOTP,
    reset: ResetOTP,
    crypto: {
      async hashSecret(password: string) {
        return await new Scrypt().hash(password);
      },
      async verifySecret(password: string, hash: string) {
        return await new Scrypt().verify(hash, password);
      },
    },
    validatePasswordRequirements: (password: string) => {
      if (password.length < 8) {
        throw new ConvexError("Password must be at least 8 characters long");
      }
    },
    profile(params) {
      // console.log("params", params)
      return {
        name: params.name as string,
        email: (params.email as string)?.toLowerCase(),
        emailVerificationTime: undefined,
        createdAt: Date.now(),
        password: params.password as string,
        newPassword: params.newPassword as string,
        firstName: params.firstName as string,
        lastName: params.lastName as string,
        accountType: params.accountType as string[],
        organizationName: params.organizationName as string,
        source: params.source as string,
        userId: params.userId as string,
        role: ["user"],
        subscription: params.subscription as string,
        tokenIdentifier: params.userId as string,
        updatedAt: Date.now(),
      };
    },
  });
