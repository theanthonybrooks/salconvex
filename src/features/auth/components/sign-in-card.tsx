"use client"

import { useAuthActions } from "@convex-dev/auth/react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SignInFlow } from "@/features/auth/types"
import { ConvexError } from "convex/values"
import { Heart, LoaderPinwheel, TriangleAlert } from "lucide-react"
import React, { useState } from "react"
import { FaGithub } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"

interface SignInCardProps {
  setState: (state: SignInFlow) => void
}

const SignInCard: React.FC<SignInCardProps> = ({
  setState,
}: SignInCardProps) => {
  const { signIn } = useAuthActions()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")

  const onPasswordSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError("")
    setSuccess("")

    signIn("password", {
      email,
      password,
      flow: "signIn",
      redirectTo: "/profile",
    })
      .then(() => {
        setSuccess("Successfully signed in!")
      })
      .catch((err) => {
        const errorMessage =
          // Check whether the error is an application error
          err instanceof ConvexError
            ? // Access data and cast it to the type we expect
              (err.data as { message: string }).message
            : // Must be some developer error,
              // and prod deployments will not
              // reveal any more information about it
              // to the client
              "Check your email/password and try again."
        // do something with `errorMessage`
        // }
        setError(errorMessage)
      })
      .finally(() => {
        setPending(false)
      })
  }

  const onProviderSignIn = (value: "github" | "google") => {
    setPending(true)
    signIn(value)
      .catch((err) => {
        console.log("err", err)
        console.log("err.message", err.message)
        console.log("err properties:", Object.keys(err))
        if (err.message === "InvalidAccountId") {
          setError("Invalid email")
          return
        }
        if (err.message === "InvalidPassword") {
          setError("Invalid password")
          return
        }
        setError("Nope.")
      })
      .finally(() => setPending(false))
  }

  return (
    <Card className='w-full h-full p-8'>
      <CardHeader className='px-0 pt-0'>
        <CardTitle>Login to continue</CardTitle>
        <CardDescription>
          Use your email or another service to continue
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
      <CardContent className='space-y-5 px-0 pb-0'>
        <form className='space-y-2.5' onSubmit={(e) => onPasswordSignIn(e)}>
          <Input
            disabled={pending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='email@email.com'
            type='email'
          />
          <Input
            disabled={pending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='********'
            type='password'
            required
          />
          <Button
            className='w-full'
            size='lg'
            type='submit'
            variant='black'
            disabled={pending}>
            {pending ? (
              <LoaderPinwheel className='animate-spin size-5' />
            ) : (
              "Continue"
            )}
          </Button>
        </form>
        <Separator />
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            type='button'
            className='w-full flex justify-center items-center gap-2'
            onClick={() => onProviderSignIn("google")}
            disabled={pending}>
            <FcGoogle size='5' />
            Google
          </Button>
          <Button
            variant='outline'
            size='sm'
            type='button'
            className='w-full flex justify-center items-center gap-2'
            onClick={() => onProviderSignIn("github")}
            disabled={pending}>
            <FaGithub size='5' />
            Github
          </Button>
          {/* <Button
            variant='outline'
            size='sm'
            type='button'
            className='w-full flex justify-center items-center gap-2'
            onClick={() => {}}
            disabled={pending}>
            <FaApple size='5' />
            Apple
          </Button> */}
        </div>
        <p className='text-xs text-muted-foreground'>
          Don&apos;t have an account?{" "}
          <span
            onClick={() => setState("signUp")}
            className='text-sky-700 hover:underline cursor-pointer'>
            Sign up
          </span>
        </p>
      </CardContent>
    </Card>
  )
}

export default SignInCard
