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
import React, { useState } from "react"
import { FaGithub } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"

interface SignInCardProps {
  setState: (state: SignInFlow) => void
}

const SignInCard: React.FC<SignInCardProps> = ({
  setState,
}: SignInCardProps) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  return (
    <Card className='w-full h-full p-8'>
      <CardHeader className='px-0 pt-0'>
        <CardTitle>Login to continue</CardTitle>
        <CardDescription>
          Use your email or another service to continue
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-5 px-0 pb-0'>
        <form className='space-y-2.5'>
          <Input
            disabled={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='email@email.com'
            type='email'
          />
          <Input
            disabled={false}
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
            disabled={false}>
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
            onClick={() => {}}
            disabled={false}>
            <FcGoogle size='5' />
            Google
          </Button>
          <Button
            variant='outline'
            size='sm'
            type='button'
            className='w-full flex justify-center items-center gap-2'
            onClick={() => {}}
            disabled={false}>
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
