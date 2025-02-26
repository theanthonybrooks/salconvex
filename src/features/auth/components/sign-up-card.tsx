"use client"

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
import { useAuthActions } from "@convex-dev/auth/react"
import { TriangleAlert } from "lucide-react"
import React, { useState } from "react"
import { FaGithub } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"

interface SignUpCardProps {
  setState: (state: SignInFlow) => void
}

const SignUpCard: React.FC<SignUpCardProps> = ({
  setState,
}: SignUpCardProps) => {
  const { signIn } = useAuthActions()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | undefined>("")

  const onPasswordSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setPending(true)
    signIn("password", { email, password, name, flow: "signUp" })
      .catch((err) => {
        if (err.message === "InvalidAccountId") {
          setError("Invalid email")
          return
        }
        if (err.message === "Invalid password") {
          setError("Invalid password")
          return
        }
        setError("An unexpected error occurred. Please try again.")
      })
      .finally(() => setPending(false))
  }

  const onProviderSignUp = (value: "github" | "google") => {
    setPending(true)
    signIn(value).finally(() => setPending(false))
  }

  return (
    <Card className='w-full h-full p-8'>
      <CardHeader className='px-0 pt-0'>
        <CardTitle>Sign up to continue</CardTitle>
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
      <CardContent className='space-y-5 px-0 pb-0'>
        <form className='space-y-2.5' onSubmit={(e) => onPasswordSignUp(e)}>
          <Input
            disabled={pending}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Full name'
          />
          <Input
            disabled={pending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Email'
            type='email'
          />
          <Input
            disabled={pending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Password'
            type='password'
            required
          />
          <Input
            disabled={pending}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder='Confirm password'
            type='password'
            required
          />
          <Button
            className='w-full'
            size='lg'
            type='submit'
            variant='black'
            disabled={pending}>
            Continue
          </Button>
        </form>
        <Separator />
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            type='button'
            className='w-full flex justify-center items-center gap-2'
            onClick={() => onProviderSignUp("google")}
            disabled={pending}>
            <FcGoogle size='5' />
            Google
          </Button>
          <Button
            variant='outline'
            size='sm'
            type='button'
            className='w-full flex justify-center items-center gap-2'
            onClick={() => onProviderSignUp("github")}
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
            disabled={false}>
            <FaApple size='5' />
            Apple
          </Button> */}
        </div>
        <p className='text-xs text-muted-foreground'>
          Already have an account?{" "}
          <span
            onClick={() => setState("signIn")}
            className='text-sky-700 hover:underline cursor-pointer'>
            Sign in
          </span>
        </p>
      </CardContent>
    </Card>
  )
}

export default SignUpCard
