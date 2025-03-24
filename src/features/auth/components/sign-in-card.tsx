"use client"

import { useAuthActions } from "@convex-dev/auth/react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConvexError } from "convex/values"
import {
  Eye,
  EyeOff,
  Heart,
  LoaderCircle,
  TriangleAlert,
  X,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useState } from "react"
import { FaApple, FaGoogle } from "react-icons/fa"

interface SignInCardProps {
  // setState: (state: SignInFlow) => void
  switchFlow: () => void
  forgotPasswordHandler: () => void
}

const SignInCard: React.FC<SignInCardProps> = ({
  switchFlow,
  forgotPasswordHandler,
}: SignInCardProps) => {
  const router = useRouter()
  const { signIn } = useAuthActions()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [isLoading, setIsLoading] = useState("")
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")

  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("src")

  const onPasswordSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError("")
    setSuccess("")
    const formData = new FormData(e.currentTarget)
    formData.append("redirectTo", "/dashboard")
    formData.append("flow", "signIn")
    signIn("password", formData)
      .then(() => {
        setSuccess("Successfully signed in!")
        if (callbackUrl && callbackUrl === "newUser") {
          router.replace("/pricing#plans")
        } else {
          router.replace("/")
        }
      })
      .catch((err) => {
        const errorMessage =
          err instanceof ConvexError
            ? (err.data as { message: string }).message
            : "Check your email/password and try again."
        setError(errorMessage)
      })
      .finally(() => {
        setPending(false)
      })
  }

  const onProviderSignIn = (value: "github" | "google" | "apple") => {
    setIsLoading(value)
    signIn(value, { redirectTo: "/" }).finally(() => {
      setPending(false)
      setIsLoading("")
    })
  }

  return (
    <Card className='md:relative w-full border-none md:border-solid md:border-2 border-foreground bg-salYellow md:bg-white shadow-none  p-6'>
      <button
        className='absolute right-5 top-4 z-10 text-lg font-bold text-foreground hover:rounded-full hover:text-salPink focus-visible:bg-salPink'
        aria-label='Back to homepage'
        tabIndex={8}
        onClick={() => router.push("/")}>
        <X size={25} />
      </button>
      <CardHeader className='px-0 pt-0 items-center'>
        <Link
          href='/'
          prefetch={true}
          className='mb-5 flex flex-col items-center'>
          <Image
            src='/sitelogo.svg'
            alt='The Street Art List'
            width={80}
            height={80}
            className='mb-4'
            priority={true}
          />
          <Image
            src='/saltext.png'
            alt='The Street Art List'
            width={300}
            height={100}
            priority={true}
          />
        </Link>
        <CardDescription className='mt-2 text-base text-foreground'>
          Please sign in to continue
        </CardDescription>
      </CardHeader>
      {!!error && (
        <div className='bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6'>
          <TriangleAlert className='size-4' />
          <p>{error}</p>
        </div>
      )}
      {!!success && (
        <div className='bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald mb-6'>
          <Heart className='size-4' />
          <p>{success}</p>
        </div>
      )}
      <CardContent className='grid gap-y-4'>
        <div className='grid grid-cols-2 gap-x-4'>
          <Button
            variant='salWithShadowHidden'
            size='lg'
            type='button'
            className='min-w-[8.5rem] w-full    gap-2 focus:bg-salYellow/70 bg-salYellow md:bg-white'
            onClick={() => onProviderSignIn("google")}
            disabled={pending}
            tabIndex={1}>
            {isLoading === "google" ? (
              <LoaderCircle className='size-4 animate-spin' />
            ) : (
              <>
                <FaGoogle size={16} />
                Google
              </>
            )}
          </Button>
          <Button
            variant='salWithShadowHidden'
            size='lg'
            type='button'
            className='min-w-[8.5rem] w-full     gap-2 focus:bg-salYellow/70 bg-salYellow md:bg-white'
            onClick={() => onProviderSignIn("apple")}
            disabled={pending}
            tabIndex={2}>
            {isLoading === "apple" ? (
              <LoaderCircle className='size-4 animate-spin' />
            ) : (
              <>
                <FaApple size={16} />
                Apple
              </>
            )}
          </Button>
        </div>
        <p className='flex items-center gap-x-3 text-sm text-foreground before:h-[1px] before:flex-1 before:bg-foreground after:h-[1px] after:flex-1 after:bg-foreground'>
          or
        </p>
        <form className=' flex flex-col' onSubmit={(e) => onPasswordSignIn(e)}>
          <div className='space-y-4 sm:space-y-2.5'>
            <Label htmlFor='email' className='text-foreground'>
              Email address
            </Label>
            <Input
              id='email'
              name='email'
              disabled={pending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=' '
              type='email'
              // inputHeight='sm'
              className='border-[1.5px] border-foreground bg-white text-foreground focus:bg-white'
              required
              tabIndex={3}
            />
            <div className='flex flex-col space-y-2.5'>
              <div className='flex justify-between items-center'>
                <Label htmlFor='password' className='text-foreground'>
                  Password
                </Label>
                <span
                  onClick={forgotPasswordHandler}
                  className='text-foreground text-sm hover:underline cursor-pointer'>
                  Forgot password?
                </span>
              </div>
              <div className='relative'>
                <Input
                  id='password'
                  name='password'
                  disabled={pending}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=' '
                  type={showPassword ? "text" : "password"}
                  // inputHeight='sm'
                  className='border-[1.5px] border-foreground bg-white text-foreground focus:bg-white'
                  required
                  tabIndex={4}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((prev) => !prev)}
                  className='absolute inset-y-0 right-0 flex items-center pr-3'
                  tabIndex={5}>
                  {showPassword ? (
                    <Eye className='size-4 text-foreground' />
                  ) : (
                    <EyeOff className='size-4 text-foreground' />
                  )}
                </button>
              </div>
            </div>
          </div>
          <Button
            className='w-full py-6 text-base   sm:py-0 mt-8 sm:mt-6 bg-white md:bg-salYellow'
            size='lg'
            type='submit'
            variant='salWithShadowYlw'
            disabled={pending}
            tabIndex={6}>
            {pending ? (
              <LoaderCircle className='animate-spin size-5' />
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className='justify-center pb-0'>
        <p className='mt-3 text-center text-sm text-foreground'>
          Don&apos;t have an account?{" "}
          <span
            onClick={switchFlow}
            className='font-medium text-zinc-950 decoration-foreground underline-offset-4 outline-hidden hover:underline focus:underline focus:decoration-foreground focus:decoration-2 focus:outline-hidden focus-visible:underline cursor-pointer'
            tabIndex={7}>
            Sign up
          </span>
        </p>
      </CardFooter>
    </Card>
  )
}

export default SignInCard
