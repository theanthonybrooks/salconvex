"use client";

import { useAuthActions } from "@convex-dev/auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConvexError } from "convex/values";
import {
  Eye,
  EyeOff,
  Heart,
  LoaderCircle,
  TriangleAlert,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaApple, FaGoogle } from "react-icons/fa";

interface SignInCardProps {
  // setState: (state: SignInFlow) => void
  switchFlow: () => void;
  forgotPasswordHandler: () => void;
}

const SignInCard: React.FC<SignInCardProps> = ({
  switchFlow,
  forgotPasswordHandler,
}: SignInCardProps) => {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [isLoading, setIsLoading] = useState("");
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const searchParams = useSearchParams();
  const callBackSrc = sessionStorage.getItem("src");
  const prevSalPage = sessionStorage.getItem("previousSalPage");

  const onPasswordSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError("");
    setSuccess("");
    const formData = new FormData(e.currentTarget);
    formData.append("redirectTo", "/dashboard");
    formData.append("flow", "signIn");
    signIn("password", formData)
      .then(() => {
        setSuccess("Successfully signed in!");
        if (callBackSrc && callBackSrc === "newUser") {
          sessionStorage.removeItem("src");
          router.replace("/pricing");
        } else if (prevSalPage) {
          router.replace(prevSalPage);
        } else {
          router.replace("/");
        }
      })
      .catch((err) => {
        const errorMessage =
          err instanceof ConvexError
            ? (err.data as { message: string }).message
            : "Check your email/password and try again.";
        setError(errorMessage);
      })
      .finally(() => {
        setPending(false);
      });
  };

  const onProviderSignIn = (value: "github" | "google" | "apple") => {
    setIsLoading(value);
    signIn(value, { redirectTo: "/auth/sign-up?err=newUser" }).finally(() => {
      setPending(false);
      setIsLoading("");
    });
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

  return (
    <Card className="w-full border-none border-foreground bg-salYellow p-6 shadow-none md:relative md:border-2 md:border-solid md:bg-white">
      <button
        className="absolute right-5 top-4 z-10 text-lg font-bold text-foreground hover:rounded-full hover:text-salPink focus-visible:bg-salPink"
        aria-label="Back to homepage"
        tabIndex={8}
        onClick={() => router.push("/")}
      >
        <X size={25} />
      </button>
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
            onClick={switchFlow}
            className="outline-hidden focus:outline-hidden cursor-pointer font-medium text-foreground decoration-foreground underline-offset-4 hover:underline focus:underline focus:decoration-foreground focus:decoration-2 focus-visible:underline"
            tabIndex={7}
          >
            Sign up
          </span>
        </CardDescription>
      </CardHeader>
      {!!error && (
        <div className="mx-auto mb-6 flex max-w-[90%] items-center gap-x-2 text-balance rounded-md bg-destructive/15 p-3 text-center text-sm text-destructive">
          <TriangleAlert className="size-6" />
          <p>{error}</p>
        </div>
      )}
      {!!success && (
        <div className="mx-auto mb-6 flex max-w-[90%] items-center gap-x-2 rounded-md bg-emerald-500/15 p-3 text-center text-sm">
          <Heart className="size-4" />
          <p>{success}</p>
        </div>
      )}
      <CardContent className="grid gap-y-4">
        <div className="grid grid-cols-2 gap-x-4">
          <Button
            variant="salWithShadowHidden"
            size="lg"
            type="button"
            className="w-full min-w-[8.5rem] gap-2 bg-salYellow focus:bg-salYellow/70 md:bg-white"
            onClick={() => onProviderSignIn("google")}
            disabled={pending}
            tabIndex={1}
          >
            {isLoading === "google" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <>
                <FaGoogle size={16} />
                Google
              </>
            )}
          </Button>

          <Button
            variant="salWithShadowHidden"
            size="lg"
            type="button"
            className="w-full min-w-[8.5rem] gap-2 bg-salYellow focus:bg-salYellow/70 md:bg-white"
            onClick={() => onProviderSignIn("apple")}
            // disabled={pending}
            //TODO: Add Apple OAuth
            disabled={true}
            tabIndex={2}
          >
            {isLoading === "apple" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <>
                <FaApple size={16} />
                Apple
              </>
            )}
          </Button>
        </div>
        <p className="flex items-center gap-x-3 text-sm text-foreground before:h-[1px] before:flex-1 before:bg-foreground after:h-[1px] after:flex-1 after:bg-foreground">
          or
        </p>
        <form className="flex flex-col" onSubmit={(e) => onPasswordSignIn(e)}>
          <div className="space-y-4 sm:space-y-2.5">
            <Label htmlFor="email" className="text-foreground">
              Email address
            </Label>
            <Input
              id="email"
              name="email"
              disabled={pending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              type="email"
              // inputHeight='sm'
              className="border-[1.5px] border-foreground bg-white text-foreground focus:bg-white"
              required
              tabIndex={3}
            />
            <div className="flex flex-col space-y-2.5">
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
                <Input
                  id="password"
                  name="password"
                  disabled={pending}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>
          </div>
          <Button
            className="mt-8 w-full bg-white py-6 text-base sm:mt-6 sm:py-0 md:bg-salYellow"
            size="lg"
            type="submit"
            variant="salWithShadowYlw"
            disabled={pending}
            tabIndex={6}
          >
            {pending ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignInCard;
