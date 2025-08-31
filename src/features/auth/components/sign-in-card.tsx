"use client";

import { useAuthActions } from "@convex-dev/auth/react";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { CloseBtn } from "@/components/ui/close-btn";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConvex, useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { Eye, EyeOff, Heart, LoaderCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaGoogle } from "react-icons/fa";
import z from "zod";
import { api } from "~/convex/_generated/api";

interface SignInCardProps {
  // setState: (state: SignInFlow) => void
  switchFlow: () => void;
  forgotPasswordHandler: () => void;
}

const SignInCard = ({ switchFlow, forgotPasswordHandler }: SignInCardProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const convex = useConvex();
  const { signIn } = useAuthActions();
  const DeleteAccount = useMutation(api.users.deleteAccount);
  const updateUserLastActive = useMutation(api.users.updateUserLastActive);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const {
    watch,
    formState: { isValid },
  } = form;

  const email = watch("email");

  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [isLoading, setIsLoading] = useState("");
  const [error, setError] = useState<React.ReactNode | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [callBackSrc, setCallBackSrc] = useState<string | null>(null);
  const [prevSalPage, setPrevSalPage] = useState<string | null>(null);

  // const callBackSrc = sessionStorage.getItem("src");
  // const prevSalPage = sessionStorage.getItem("previousSalPage");
  const isNewUser = callBackSrc === "newUser";
  // const callBackSrc = sessionStorage.getItem("src");
  // const prevSalPage = sessionStorage.getItem("previousSalPage");

  const handlePasswordSignIn = async (values: z.infer<typeof LoginSchema>) => {
    setPending(true);
    setError("");
    setSuccess("");
    try {
      const hasVerifiedEmail = await convex.query(api.users.hasVerifiedEmail, {
        email,
      });
      if (!hasVerifiedEmail) {
        await DeleteAccount({ method: "cancelSignup", email });
        throw new Error("unverified");
      }

      const formData = {
        ...values,
        flow: "signIn",
        redirectTo: "/dashboard",
      };

      await signIn("password", formData);

      setSuccess("Successfully signed in!");

      if (isNewUser) {
        sessionStorage.removeItem("src");
        router.replace("/pricing");
      } else if (prevSalPage) {
        router.replace(prevSalPage);
      } else {
        router.replace("/");
      }
      if (!isNewUser) {
        await updateUserLastActive({ email });
      }
    } catch (error) {
      console.log(error);
      if (error instanceof ConvexError) {
        const data = error.data as { message: string; contactUrl: string };
        console.log(data, error);
        if (error.data.includes("User not found")) {
          setError("User not found. Check your email/password and try again");
        } else {
          setError(
            data.contactUrl ? (
              <>
                {data.message.split("contact us")[0]}
                <Link
                  href={data.contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline-offset-2 hover:cursor-pointer hover:underline"
                >
                  contact us
                </Link>
                {data.message.split("contact us")[1]}
              </>
            ) : (
              "An error occurred. Please try again."
            ),
          );
        }
      } else {
        if (error instanceof Error) {
          if (error.message.includes("InvalidSecret")) {
            setError("Incorrect email/password. Please try again.");
          } else if (error.message.includes("unverified")) {
            setError(
              "Your previous signup was never completed. Please sign up again",
            );
            form.reset();
            setTimeout(() => {
              setError("");
            }, 5000);
          } else {
            setError("Incorrect email/password. Please try again.");
          }
        } else {
          setError("An error occurred. Please try again.");
          console.error("Unexpected error:", error);
        }
      }
    } finally {
      setPending(false);
    }
  };

  const onProviderSignIn = async (value: "github" | "google" | "apple") => {
    setIsLoading(value);
    try {
      await signIn(value, { redirectTo: "/auth/sign-up?err=newUser" });
    } catch (error) {
      throw new Error("Error signing in", { cause: error });
    } finally {
      setPending(false);
      setSuccess("Redirecting...");
    }
  };

  useEffect(() => {
    const errorDesc = searchParams.get("err");
    if (errorDesc) {
      if (errorDesc === "newUser") {
        setError("No account found. Sign up with email and password first.");
        setTimeout(() => {
          setError("");
          const url = new URL(window.location.href);
          url.searchParams.delete("err");
          window.history.replaceState({}, "", url.toString());
        }, 10000);

        return;
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCallBackSrc(sessionStorage.getItem("src"));
      setPrevSalPage(sessionStorage.getItem("previousSalPage"));
    }
  }, []);

  useEffect(() => {
    const subscription = watch(() => {
      if (error) setError("");
    });
    return () => subscription.unsubscribe();
  }, [watch, error]);

  return (
    <Card className="w-full border-none border-foreground bg-salYellow p-6 shadow-none md:relative md:border-2 md:border-solid md:bg-white">
      <CloseBtn
        ariaLabel="Back to homepage"
        type="icon"
        onAction={() => router.push("/")}
        tabIndex={8}
      />
      <CardHeader className="items-center px-0 pt-0">
        <Link
          href="/"
          prefetch={true}
          className="mb-5 flex flex-col items-center"
        >
          <Image
            src="/sitelogo.svg"
            alt="The Street Art List"
            width={80}
            height={80}
            className="mb-4"
            priority={true}
          />
          <Image
            src="/saltext.png"
            alt="The Street Art List"
            width={300}
            height={100}
            priority={true}
          />
        </Link>
        <CardDescription className="mt-1 flex items-center gap-x-2 text-center text-lg text-foreground">
          Don&apos;t have an account?
          <span
            onClick={() => {
              sessionStorage.setItem("src", "newUser");
              switchFlow();
            }}
            className="outline-hidden focus:outline-hidden cursor-pointer font-black text-foreground decoration-foreground underline-offset-4 hover:underline focus:underline focus:decoration-foreground focus:decoration-2 focus-visible:underline"
            tabIndex={7}
          >
            Sign up
          </span>
        </CardDescription>
      </CardHeader>
      {error && (
        <FormError
          message={error}
          className="mx-auto mb-6 w-auto max-w-[90%]"
        />
      )}
      {success && (
        <FormSuccess
          message={success}
          className="mx-auto mb-6 w-auto max-w-[90%]"
          icon={<Heart className="size-4" />}
        />
      )}
      <CardContent className="grid gap-y-4 px-4 sm:px-6">
        <Button
          variant="salWithShadowHidden"
          size="lg"
          type="button"
          className="w-full min-w-[8.5rem] gap-2 bg-salYellow focus:bg-salYellow/70 focus-visible:translate-x-[3px] focus-visible:translate-y-[-3px] focus-visible:shadow-slg md:bg-white"
          onClick={() => onProviderSignIn("google")}
          disabled={pending}
          tabIndex={1}
        >
          {isLoading === "google" ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <>
              <FaGoogle className="size-4" />
              Continue with Google
            </>
          )}
        </Button>
        <p className="flex items-center gap-x-3 text-sm text-foreground before:h-[1px] before:flex-1 before:bg-foreground after:h-[1px] after:flex-1 after:bg-foreground">
          or
        </p>
        <Form {...form}>
          <form
            className="flex flex-col"
            onSubmit={form.handleSubmit(handlePasswordSignIn)}
          >
            <div className="space-y-4 sm:space-y-2.5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled={pending}
                        {...field}
                        type="email"
                        inputHeight="default"
                        variant="basic"
                        tabIndex={2}
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
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-bold">Password</FormLabel>
                      <span
                        onClick={forgotPasswordHandler}
                        className="cursor-pointer text-sm text-foreground hover:underline focus-visible:underline"
                        tabIndex={5}
                      >
                        Forgot password?
                      </span>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          disabled={pending}
                          {...field}
                          type={showPassword ? "text" : "password"}
                          inputHeight="default"
                          variant="basic"
                          tabIndex={3}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="group absolute inset-y-0 right-0 flex items-center pr-3"
                          tabIndex={4}
                        >
                          {showPassword ? (
                            <Eye className="size-4 rounded-sm text-foreground outline-offset-2 group-focus-visible:outline" />
                          ) : (
                            <EyeOff className="size-4 rounded-sm text-foreground outline-offset-2 group-focus-visible:outline" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <div className="flex flex-col space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground">
                    Password
                  </Label>
                  <span
                    onClick={forgotPasswordHandler}
                    className="cursor-pointer text-sm text-foreground hover:underline"
                  >
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Controller
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="password"
                        disabled={pending}
                        placeholder=" "
                        type={showPassword ? "text" : "password"}
                        className="border-[1.5px] border-foreground bg-white text-foreground focus:bg-white"
                        required
                        tabIndex={4}
                      />
                    )}
                  />
              
                </div>
              </div> */}
            </div>
            <Button
              className="mt-8 w-full bg-white py-6 text-base focus-visible:bg-salPinkLt sm:mt-6 sm:py-0 md:bg-salYellow"
              size="lg"
              type="submit"
              variant={
                !isValid || pending || Boolean(success) || Boolean(error)
                  ? "salWithShadowHidden"
                  : "salWithShadowYlw"
              }
              disabled={
                pending || Boolean(success) || !isValid || Boolean(error)
              }
              tabIndex={6}
            >
              {pending ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : Boolean(success) ? (
                "Success!"
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SignInCard;
