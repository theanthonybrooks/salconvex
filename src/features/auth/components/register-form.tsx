"use client";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { MultiSelect } from "@/components/multi-select";
import { useAuthActions } from "@convex-dev/auth/react";
import { AnimatePresence, motion } from "framer-motion";

import ResendTimer from "@/components/resend-timer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DialogCloseBtn } from "@/components/ui/dialog-close-btn";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { PasswordInput } from "@/components/ui/password-input";
import SmileySvg from "@/features/auth/components/smiley-svg";
import SpeechBubble from "@/features/auth/components/speech-bubble";
import { onEmailChange } from "@/helpers/privacyFns";
import { RegisterSchema } from "@/schemas/auth";
import { accountTypeOptions } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConvex, useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ExternalLink, LoaderCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { api } from "~/convex/_generated/api";
import { AccountType } from "~/convex/schema";

interface RegisterFormProps {
  // setState: (state: SignInFlow) => void
  switchFlow: () => void;
}

type StepType = "signUp" | "verifyOtp";

const RegisterForm = ({ switchFlow }: RegisterFormProps) => {
  const router = useRouter();
  const userId = uuidv4();
  const convex = useConvex();
  const updateVerification = useMutation(api.users.updateUserEmailVerification);

  const DeleteAccount = useMutation(api.users.deleteAccount);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const prevOtp = useRef<string>("");
  const { signIn } = useAuthActions();
  // const [isPending1, startTransition] = useTransition();
  const [isPending, setPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ReactNode | undefined>("");
  const [success, setSuccess] = useState<ReactNode | undefined>("");
  const [selectedOption, setSelectedOption] = useState<AccountType>(["artist"]);
  const [submitData, setSubmitData] = useState<object>({});
  // const [step, setStep] = useState<StepType>("verifyOtp")
  const [step, setStep] = useState<StepType>("signUp");
  const [email, setEmail] = useState<string>("");
  const [obsEmail, setObsEmail] = useState("");
  const [otp, setOtp] = useState<string>("");
  // const callBackSrc = sessionStorage.getItem("src");
  // const prevSalPage = sessionStorage.getItem("previousSalPage");

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      organizationName: "",
      name: "",
      source: "",
      accountType: ["artist"],
    },
    mode: "onChange",
    delayError: 1000,
  });

  const {
    formState: { isValid },
  } = form;

  useEffect(() => {
    const accountType = form.getValues("accountType");
    const organizationName = form.getValues("organizationName");

    if (
      Array.isArray(accountType) &&
      accountType.length === 1 &&
      accountType[0] === "artist" &&
      organizationName !== ""
    ) {
      form.setValue("organizationName", "");
    } else if (selectedOption.includes("organizer")) {
      form.trigger("organizationName");
    }
  }, [selectedOption, form]);

  const handleStep1Submit = async (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");
    setPending(true);
    try {
      const isNewUser = await convex.query(api.users.isNewUser, {
        email: values.email,
      });
      if (!isNewUser) {
        setError("A user with that email already exists.");
        return;
      }

      if (values.organizationName?.trim()) {
        const isNewOrg = await convex.query(
          api.organizer.organizations.isNewOrg,
          {
            email: values.email.trim(),
            organizationName: values.organizationName.trim(),
          },
        );

        if (!isNewOrg) {
          setError(
            "An organization with that name already exists. Please contact us if you feel this is an error.",
          );
          return;
        }
      }

      const formData = {
        ...values,
        accountType: selectedOption,
        userId: userId,
        flow: "signUp",
      };

      setSubmitData(formData);
      setEmail(values.email);
      onEmailChange(values.email, setObsEmail);

      await signIn("password", { ...formData, flow: "signUp" });
      setStep("verifyOtp");
    } catch (error) {
      if (error instanceof ConvexError) {
        const data = error.data as { message: string; contactUrl: string };
        setError(
          data.contactUrl ? (
            <>
              {data.message.split("contact us")[0]}
              <Link
                href={`mailto:${data.contactUrl}?subject=${
                  values.organizationName?.trim() + " -" || ""
                } Organization Signup`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline-offset-2 hover:cursor-pointer hover:underline"
              >
                contact us
              </Link>
              {data.message.split("contact us")[1]}
            </>
          ) : (
            "Organization Exists"
          ),
        );
      } else {
        console.error(error);
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setPending(false);
    }
  };
  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError("");
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("No email found. Please try signing up again.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      await DeleteAccount({ method: "resentOtp", email });
      await signIn("password", { ...submitData, flow: "signUp" });

      setSuccess("Verification code resent!");
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      if (err instanceof ConvexError) {
        console.error(err.data);
        setError(err.data);
      } else {
        console.error("Error resending verification code:", err);
        setError("Could not resend verification code. Please try again.");
      }
    }
  };

  const handleOtpSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setError("");
      setSuccess("");
      setIsLoading(true);

      if (!otp || otp.length !== 6) {
        setIsLoading(false);
        setError("Please enter a valid 6-digit code");
        return;
      }

      try {
        await convex.query(api.users.hasVerifiedEmail, { email });

        const result = await signIn("password", {
          email,
          code: otp,
          flow: "email-verification",
        });

        if (result) {
          await updateVerification({ email });
          setSuccess("Successfully signed up and verified!");
          setTimeout(() => {
            setSuccess(
              <span className="flex items-center gap-1">
                Signing in...
                <LoaderCircle className="size-3 animate-spin" />
              </span>,
            );
          }, 1500);
          form.reset();
          const callBackSrc = sessionStorage.getItem("src");
          const prevSalPage = sessionStorage.getItem("previousSalPage");

          if (callBackSrc && callBackSrc === "newUser") {
            sessionStorage.removeItem("src");
            router.replace("/pricing");
          } else if (prevSalPage) {
            router.replace(prevSalPage);
          } else {
            router.replace("/pricing");
          }
        }
      } catch (error) {
        if (error instanceof ConvexError) {
          if (error.data.includes("User not found")) {
            setStep("signUp");
            setOtp("");
            setError("Signup timed out. Please try again.");
          }
        } else {
          console.error("Error in handleOtpSubmit:", error);
          setError("Invalid code or verification failed. Please try again.");
          setOtp("");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      otp,
      setError,
      setIsLoading,
      setSuccess,
      router,
      email,
      form,
      signIn,
      updateVerification,
      convex,
    ],
  );

  const onCancelSignup = async () => {
    if (step === "signUp") {
      router.push("/");
      return;
    }

    try {
      await DeleteAccount({ method: "cancelSignup", email });
    } catch (err) {
      console.error("Error deleting account:", err);
    } finally {
      router.push("/");
    }
  };

  useEffect(() => {
    if (otp === "") {
      otpInputRef.current?.focus();
    }
  }, [otp]);

  useEffect(() => {
    form.setValue("accountType", selectedOption);
  }, [selectedOption, form]);

  useEffect(() => {
    if (step === "verifyOtp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  useEffect(() => {
    if (otp === prevOtp.current || otp.length !== 6) return;
    if (otp.length === 6) {
      prevOtp.current = otp;
      handleOtpSubmit();
    }
  }, [otp, handleOtpSubmit]);

  return (
    <Card className="w-full border-none border-foreground bg-salYellow p-6 shadow-none md:relative md:border-2 md:border-solid md:bg-white">
      <DialogCloseBtn
        title="Are you sure?"
        description="You can always start again at any time though an account is required to apply to open calls."
        actionTitle="Confirm"
        onAction={onCancelSignup}
      />
      {step === "signUp" && (
        <CardHeader className="space-y-0 pb-0">
          <section className="flex flex-col items-center justify-center space-y-2.5">
            <Link
              href="/"
              prefetch={true}
              className="flex flex-col items-center"
            >
              <Image
                src="/sitelogo.svg"
                alt="The Street Art List"
                width={80}
                height={80}
                className="mb-2"
                priority={true}
              />
            </Link>
            <Image
              src="/createaccount.svg"
              alt="The Street Art List"
              width={300}
              height={100}
              priority={true}
              className="mb-5 ml-1"
            />
            {/* <p className='text-sm'>
              Read more about account types{" "}
              <Link
                href='/pricing'
                className='underline font-medium text-zinc-950 decoration-foreground underline-offset-4 outline-hidden focus:underline focus:decoration-foreground focus:decoration-2 focus:outline-hidden focus-visible:underline-offset-2 hover:underline-offset-1 cursor-pointer'>
                here
              </Link>
            </p> */}
          </section>
          <p className="py-5 text-center text-lg text-foreground">
            Already have an account?{" "}
            <span
              onClick={() => {
                sessionStorage.removeItem("src");
                switchFlow();
              }}
              className="outline-hidden focus:outline-hidden cursor-pointer font-black text-zinc-950 decoration-foreground underline-offset-4 hover:underline focus:underline focus:decoration-foreground focus:decoration-2 focus-visible:underline"
              tabIndex={
                step === "signUp" && selectedOption.includes("organizer")
                  ? 13
                  : 12
              }
            >
              Sign in
            </span>
          </p>
        </CardHeader>
      )}
      {step === "verifyOtp" && (
        <CardHeader className="relative h-[220px]">
          <div className="relative h-full w-full">
            <SpeechBubble
              strokeWidth="4"
              className="absolute left-[50%] top-[50%] h-auto w-[20em] -translate-x-1/2 -translate-y-1/2 md:w-[21.5em]"
            />

            {/* Adjust top offset to match the speech bubble’s center */}
            <div className="absolute left-[50%] top-[37%] z-10 w-full max-w-[300px] -translate-x-1/2 -translate-y-1/2 transform text-center">
              <CardTitle className="mb-2 text-4xl">Verify your email</CardTitle>
              <CardDescription className="max-w-[300px] text-balance text-center text-base text-foreground">
                {email
                  ? "We sent a code to " + obsEmail + "!"
                  : "We sent you a verification code!"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="flex flex-col gap-y-2.5">
        {step === "signUp" ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleStep1Submit)}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex w-full flex-col gap-x-4 space-y-4 md:flex-row md:space-y-0">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="font-bold">First Name</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending}
                            {...field}
                            placeholder="Given name(s)"
                            inputHeight="sm"
                            variant="basic"
                            tabIndex={step === "signUp" ? 1 : -1}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="font-bold">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending}
                            {...field}
                            placeholder="Family/Surname(s)"
                            inputHeight="sm"
                            variant="basic"
                            tabIndex={step === "signUp" ? 2 : -1}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Email</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          {...field}
                          placeholder="email@example.com"
                          type="email"
                          inputHeight="sm"
                          variant="basic"
                          tabIndex={step === "signUp" ? 3 : -1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Password</FormLabel>

                      <FormControl>
                        <PasswordInput
                          isPending={isPending}
                          placeholder={{
                            default: "*********",
                            show: "Password1!",
                          }}
                          inputHeight="sm"
                          tabIndex={step === "signUp" ? 4 : -1}
                          field={field}
                          showChecklist
                          type="register"
                        />
                      </FormControl>
                      {/* <FormMessage /> */}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem emptyError>
                      <FormLabel className="font-bold">Account Type</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={accountTypeOptions}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedOption(value as AccountType);
                          }}
                          defaultValue={field.value}
                          placeholder="Select account type(s)"
                          variant="basic"
                          maxCount={3}
                          height={9}
                          hasSearch={false}
                          selectAll={false}
                          tabIndex={step === "signUp" ? 5 : -1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedOption.includes("artist") && (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">
                          Preferred/Artist Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending}
                            {...field}
                            placeholder="(optional)"
                            inputHeight="sm"
                            variant="basic"
                            tabIndex={step === "signUp" ? 7 : -1}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedOption.includes("organizer") && (
                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem emptyError>
                        <FormLabel className="font-bold">
                          Organization Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending}
                            {...field}
                            placeholder="(required)"
                            inputHeight="sm"
                            variant="basic"
                            tabIndex={
                              step === "signUp" &&
                              selectedOption.includes("organizer")
                                ? 8
                                : -1
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">
                        Where did you hear about us?
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          {...field}
                          placeholder="IG, Google, Friends, etc? "
                          inputHeight="sm"
                          variant="basic"
                          tabIndex={
                            step === "signUp" &&
                            selectedOption.includes("organizer")
                              ? 9
                              : 8
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <AnimatePresence>
                {(success || error) && (
                  <motion.div
                    key={success ? "success" : "error"} // Unique key to trigger reanimation
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {success && <FormSuccess message={success} />}
                    {error && <FormError message={error} />}
                  </motion.div>
                )}
              </AnimatePresence>
              <Button
                disabled={isPending || !isValid}
                className="mt-6 w-full bg-white text-base md:bg-salYellow"
                size="lg"
                type="submit"
                variant={
                  !isValid ? "salWithShadowHiddenYlw" : "salWithShadowYlw"
                }
                tabIndex={
                  step === "signUp" && selectedOption.includes("organizer")
                    ? 10
                    : 9
                }
              >
                {isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : Boolean(success) ? (
                  "Account Created!"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
            <CardFooter className="flex flex-col justify-center px-0 pb-0 pt-4">
              <p className="mt-3 text-center text-sm text-foreground">
                By creating an account, you agree to our
                <br />
                <Link
                  href="/terms"
                  className="outline-hidden focus:outline-hidden cursor-pointer font-bold decoration-foreground underline-offset-2 hover:underline focus:underline focus:decoration-foreground focus:decoration-2 focus-visible:underline"
                  tabIndex={
                    step === "signUp" && selectedOption.includes("organizer")
                      ? 11
                      : 10
                  }
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="outline-hidden focus:outline-hidden inline-flex cursor-pointer items-center font-bold decoration-foreground underline-offset-2 hover:underline focus:underline focus:decoration-foreground focus:decoration-2 focus-visible:underline"
                  tabIndex={
                    step === "signUp" && selectedOption.includes("organizer")
                      ? 12
                      : 11
                  }
                >
                  Privacy Policy <ExternalLink size={16} className="ml-[2px]" />
                </Link>
              </p>
            </CardFooter>
          </Form>
        ) : (
          <Form {...form}>
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="relative mx-auto mb-5 aspect-square w-full max-w-[25em] md:w-[90%] md:min-w-[350px] md:max-w-[45em]">
                <SmileySvg
                  width="100%"
                  // className='absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]'
                  className="relative min-w-[300px]"
                />
                <CardContent className="absolute left-1/2 top-[65.5%] grid -translate-x-1/2 -translate-y-1/2 transform gap-y-4">
                  <div className="grid items-center justify-center gap-y-2"></div>
                  <InputOTP
                    // {...resetForm.register("code")}
                    id="otp"
                    name="otp"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={otp}
                    onChange={handleOtpChange}
                    disabled={isLoading}
                    // tabIndex={step !== 'forgot' && 1}
                    tabIndex={1}
                    className="border-foreground"
                    ref={otpInputRef}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="bg-white" border="2" />
                      <InputOTPSlot index={1} className="bg-white" border="2" />
                      <InputOTPSlot index={2} className="bg-white" border="2" />
                      <InputOTPSlot index={3} className="bg-white" border="2" />
                      <InputOTPSlot index={4} className="bg-white" border="2" />
                      <InputOTPSlot index={5} className="bg-white" border="2" />
                    </InputOTPGroup>
                  </InputOTP>
                </CardContent>
              </div>
              {/* <FormLabel>Enter the OTP sent to {email}</FormLabel> */}
              <ResendTimer initialTime={60} onResend={handleResendCode} />

              <FormSuccess message={success} />
              <FormError message={error} />
              <Button
                variant={
                  otp.length === 6 && !Boolean(error)
                    ? "salWithShadowYlw"
                    : "salWithShadowHidden"
                }
                disabled={
                  isLoading ||
                  otp.length !== 6 ||
                  Boolean(error) ||
                  Boolean(success)
                }
                size="lg"
                type="submit"
                className="hidden w-full bg-white text-base sm:bg-salYellow sm:text-base"
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : Boolean(success) ? (
                  "Success!"
                ) : (
                  "Verify"
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
