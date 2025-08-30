import { FormError } from "@/components/form-error";
import ResendTimer from "@/components/resend-timer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { DialogCloseBtn } from "@/components/ui/dialog-close-btn";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supportEmail } from "@/constants/siteInfo";
import { ForgotPasswordSchema, ResetPasswordSchema } from "@/schemas/auth";
import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConvex, useMutation } from "convex/react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Eye, EyeOff, InfoIcon, LoaderCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/convex/_generated/api";

interface ForgotPasswordProps {
  switchFlow: () => void;
}

const ForgotPassword = ({ switchFlow }: ForgotPasswordProps) => {
  const router = useRouter();
  const convex = useConvex();
  const updatePassword = useMutation(api.users.updatePassword);
  const { signIn } = useAuthActions();
  const prevOtp = useRef<string>("");
  const [step, setStep] = useState<string>("forgot");
  const [email, setEmail] = useState<string>("");
  // const [newPassword, setNewPassword] = useState<string>("")
  // const [otp, setOtp] = useState<string>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<ReactNode | undefined>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);

  const forgotForm = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });

  const resetForm = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { code: "", newPassword: "" },
    mode: "onChange",
  });

  const {
    formState: { errors: forgotErrors, isValid: isForgotValid },
  } = forgotForm;

  const {
    watch,
    formState: { errors: resetErrors, isValid: isResetValid },
  } = resetForm;

  const otp = watch("code");

  // const handleOtpChange = (value: string) => {
  //   setOtp(value);
  // };

  const handleForgotSubmit = async (
    data: z.infer<typeof ForgotPasswordSchema>,
  ) => {
    setError("");
    try {
      const isNewUser = await convex.query(api.users.isNewUser, {
        email: data.email,
      });
      if (isNewUser) {
        // console.log("isNewUser", isNewUser)
        // setError("No user with that email exists. If you think this is a mistake, please contact us.");
        setError(
          <>
            <span className="hidden md:block">
              No user found with that email address. <br />
              If you think this is a mistake,{" "}
              <Link
                href={`mailto:${supportEmail}?subject=Forgot password`}
                className="font-medium underline underline-offset-2 hover:underline-offset-4"
              >
                contact us
              </Link>
            </span>
            <span className="block md:hidden">
              No user found with that email. <br />
              If this is a mistake,{" "}
              <Link
                href={`mailto:${supportEmail}?subject=Forgot password`}
                className="font-medium underline underline-offset-2 hover:underline-offset-4"
              >
                contact us
              </Link>
            </span>
          </>,
        );

        return;
      }
    } catch (queryError) {
      console.error("Error checking for existing user:", queryError);
    }
    try {
      setPending(true);
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("flow", "reset");
      // console.log("formData", formData)
      await signIn("password", formData);
      // setOtp("");
      setStep("reset");
      setEmail(data.email);
      setSuccess("Code sent!");

      forgotForm.reset();
    } catch {
      setError("Failed to send code. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const handleResetSubmit = async (
    data: z.infer<typeof ResetPasswordSchema>,
  ) => {
    setPending(true);
    setError("");
    try {
      const formData = {
        ...data,
        // code: otp,
        flow: "reset-verification",
        email: email,
      };
      await signIn("password", formData);
      await updatePassword({
        email,
        password: data.newPassword,
        method: "forgot",
      });
      // console.log("formData", formData)

      setSuccess("Password reset!");
      resetForm.reset();
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Could not verify code")
      ) {
        setError("Invalid code. Please try again.");
      } else {
        setError("Failed to reset password. Please try again.");
      }
      setSuccess("");
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    if (otp === prevOtp.current || otp.length !== 6) return;
    if (otp.length === 6) {
      prevOtp.current = otp;
      setError("");
    }
  }, [otp]);

  return step === "forgot" ? (
    <Card className="w-full border-none border-foreground bg-salYellow p-8 shadow-none md:relative md:border-2 md:border-solid md:bg-white">
      <DialogCloseBtn
        title="Where would you like to go?"
        description="If you've remembered your password, you can login. Otherwise, you can stay here to reset your password, or go to the homepage."
        actionTitle="Login"
        onAction={switchFlow}
        primaryActionTitle="Return to homepage"
        onPrimaryAction={() => router.push("/")}
      />

      <Form {...forgotForm}>
        <CardHeader className="items-center justify-center space-y-6 px-0 pt-0">
          <section className="flex flex-col items-center justify-center">
            <Link
              href="/"
              prefetch={true}
              className="mb-2 flex flex-col items-center"
            >
              <Image
                src="/sitelogo.svg"
                alt="The Street Art List"
                width={80}
                height={80}
                className="mb-4"
                priority={true}
              />
            </Link>
            <Image
              src="/forgot-pw.png"
              alt="The Street Art List"
              width={400}
              height={100}
              priority={true}
              className="ml-2"
            />
          </section>
          <CardDescription className="text-center text-base text-foreground">
            {error ? (
              <FormError message={error} />
            ) : (
              "Enter your email address for a reset code"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0 sm:px-10">
          <Separator thickness={2} className="mb-4 border-foreground" />
          <form
            onSubmit={forgotForm.handleSubmit(handleForgotSubmit)}
            className="flex flex-col space-y-6"
          >
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-foreground">
                Email address
              </Label>
              <Input
                {...forgotForm.register("email")}
                className="border-[1.5px] border-foreground bg-white text-foreground focus:bg-white"
                placeholder="youremail@mail.com"
                type="text"
                name="email"
              />
              {forgotErrors.email && (
                <p className="text-sm text-red-500">
                  {forgotErrors.email.message}
                </p>
              )}
            </div>

            <Button
              variant={isForgotValid ? "salWithShadow" : "salWithShadowHidden"}
              type="submit"
              size="lg"
              disabled={!isForgotValid}
            >
              {pending ? (
                <LoaderCircle className="animate-spin" />
              ) : Boolean(success) ? (
                "Code sent!"
              ) : (
                "Send code"
              )}
            </Button>
          </form>
        </CardContent>
      </Form>
      <CardFooter className="justify-center p-4 pb-0">
        <p className="mt-3 text-center text-sm text-foreground">
          Remember your password?{" "}
          <span
            onClick={switchFlow}
            className="outline-hidden focus:outline-hidden cursor-pointer font-medium text-zinc-950 decoration-foreground underline-offset-4 hover:underline focus:underline focus:decoration-foreground focus:decoration-2 focus-visible:underline"
            tabIndex={7}
          >
            Sign in
          </span>
        </p>
      </CardFooter>
    </Card>
  ) : (
    <Card className="w-full border-none border-foreground bg-salYellow shadow-none md:relative md:border-2 md:border-solid md:bg-white md:p-8">
      <DialogCloseBtn
        title="Where would you like to go?"
        description="If you've remembered your password, you can login. Otherwise, enter the code to reset your password, or go to the homepage."
        actionTitle="Login"
        onAction={switchFlow}
        primaryActionTitle="Return to homepage"
        onPrimaryAction={() => router.push("/")}
      />
      <Form {...resetForm}>
        <CardHeader className="flex-col items-center justify-center">
          <div className="flex flex-row items-center justify-center">
            <Image
              src="/email-sent.png"
              alt="Email Sent"
              width={250}
              height={100}
              priority={true}
              className="ml-2"
            />
          </div>
          {email && <h1 className="text-foreground"> to: {email}</h1>}
        </CardHeader>

        <CardContent className="p-0">
          {success === "Code sent!" && !error && (
            <div className="flex w-auto items-center justify-center gap-x-4 rounded-lg bg-emerald-500/20 p-4 md:mx-10">
              <InfoIcon className="size-8 text-emerald-500" />
              <div className="flex flex-col">
                <p className="text-balance text-center text-sm">
                  Please check your email for the code
                </p>
                <p className="text-balance text-center text-sm">
                  (it could be in your spam folder)
                </p>
              </div>
            </div>
          )}
          {error && <FormError message={error} className="w-auto md:mx-10" />}

          <form
            onSubmit={resetForm.handleSubmit(handleResetSubmit)}
            className="flex flex-col justify-center space-y-6 px-8"
          >
            <Label
              htmlFor="code"
              className="mt-5 text-center text-base text-foreground"
            >
              Please enter the code sent to your email
            </Label>
            <Controller
              control={resetForm.control}
              name="code"
              render={({ field }) => (
                <InputOTP
                  {...field}
                  id="code"
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  // value={otp}
                  // onChange={handleOtpChange}
                  disabled={pending}
                  // tabIndex={step !== 'forgot' && 1}
                  tabIndex={1}
                  className="border-foreground"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="bg-white" />
                    <InputOTPSlot index={1} className="bg-white" />
                    <InputOTPSlot index={2} className="bg-white" />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} className="bg-white" />
                    <InputOTPSlot index={4} className="bg-white" />
                    <InputOTPSlot index={5} className="bg-white" />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
            {resetErrors.code && (
              <p className="w-full text-center text-sm text-red-500">
                {resetErrors.code.message}
              </p>
            )}
            <ResendTimer
              initialTime={60}
              onResend={() => handleForgotSubmit({ email })}
            />
            <div className="mb-6 flex flex-col space-y-2.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="newPassword"
                  className="text-base text-foreground"
                >
                  Enter your new password
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="newPassword"
                  {...resetForm.register("newPassword")}
                  name="newPassword"
                  disabled={pending}
                  // value={password}
                  // onChange={(e) => setNewPassword(e.target.value)}
                  placeholder=" "
                  type={showPassword ? "text" : "password"}
                  // inputHeight='sm'
                  className="border-[1.5px] border-foreground bg-white text-foreground focus:bg-white"
                  required
                  tabIndex={4}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  tabIndex={5}
                >
                  {showPassword ? (
                    <Eye className="size-4 text-foreground" />
                  ) : (
                    <EyeOff className="size-4 text-foreground" />
                  )}
                </button>
              </div>
              {resetErrors.newPassword && (
                <p className="text-sm text-red-500">
                  {resetErrors.newPassword.message}
                </p>
              )}
            </div>
            {/* <input
              type='hidden'
              value={step.email}
              {...resetForm.register("email")}
            /> */}
            {/* {error && <div className="error">{error}</div>} */}
            <div className="flex justify-center gap-x-4">
              <DialogCloseBtn
                title="Are you sure?"
                description="If you've remembered your password, you can login. Otherwise, you can stay here to reset your password, or go to the homepage."
                actionTitle="Login"
                onAction={switchFlow}
                primaryActionTitle="Return to homepage"
                onPrimaryAction={() => setStep("forgot")}
                type="button"
                triggerTitle="Cancel"
                triggerClassName="w-full md:bg-white"
                triggerVariant="salWithShadowHiddenYlw"
              />
              <Button
                variant={
                  !isResetValid || Boolean(error)
                    ? "salWithShadowHidden"
                    : "salWithShadowYlw"
                }
                type="submit"
                size="lg"
                className="w-full md:bg-salYellow"
                disabled={
                  pending ||
                  !isResetValid ||
                  Boolean(error) ||
                  success === "Password reset!"
                }
              >
                {pending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Form>
    </Card>
  );
};

export default ForgotPassword;
